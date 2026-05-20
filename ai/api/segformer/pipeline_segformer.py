import os
import shutil
import cv2
import json
import random
import numpy as np
import torch
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
from transformers import SegformerForSemanticSegmentation
import albumentations as A
from albumentations.pytorch import ToTensorV2
import subprocess
import re
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import io
import base64
from fastapi.responses import JSONResponse


HEATMAP_W = 1024
HEATMAP_H = 512
Threshold = 0.40

app = FastAPI()


class VideoPipeline:
    def __init__(self, videoPath, direction, outputDir="output"):
        self.videoPath = videoPath
        self.direction = direction
        self.framesDir = os.path.join(outputDir, "frames")
        self.barMasksDir = os.path.join(outputDir, "barMasks")
        self.outputDir = outputDir
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        for d in [self.framesDir, self.barMasksDir]:
            if os.path.exists(d):
                shutil.rmtree(d)
            os.makedirs(d)

        for fname in ["heatmapData.npy", "heatmap.png"]:
            fpath = os.path.join(outputDir, fname)
            if os.path.exists(fpath):
                os.remove(fpath)

    def extractFrames(self):
        cap = cv2.VideoCapture(self.videoPath)
        count = 1
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            cv2.imwrite(os.path.join(self.framesDir, f"barFrame_{count}.jpg"), frame)
            count += 1
        cap.release()

    def validateFrames(self, modelPath, numSamples=3, imgSize=512):
        fnames = sorted(
            os.listdir(self.framesDir),
            key=lambda x: int(x.split("_")[1].split(".")[0])
        )
        if len(fnames) == 0:
            return False

        samples = random.sample(fnames, min(numSamples, len(fnames)))
        model = SegformerForSemanticSegmentation.from_pretrained(modelPath)
        model.to(self.device).eval()

        transform = A.Compose([
            A.Resize(imgSize, imgSize),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ])

        anyMaskFound = False
        for fname in samples:
            imgBGR = cv2.imread(os.path.join(self.framesDir, fname))
            imgRGB = cv2.cvtColor(imgBGR, cv2.COLOR_BGR2RGB)
            tensor = transform(image=imgRGB)["image"].unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = model(pixel_values=tensor).logits
                if logits.shape[1] > 1:
                    logits = logits[:, 1:2]
                prob = torch.sigmoid(logits).cpu().numpy()[0, 0]

            mask = (prob > 0.5).astype(np.uint8)
            if mask.sum() > 0:
                anyMaskFound = True

        return anyMaskFound

    def computeGrayHist(self, imgBGR):
        gray = cv2.cvtColor(imgBGR, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        cv2.normalize(hist, hist)
        return hist

    def runSegmentation(self, modelPath, threshold=0.5, imgSize=512, batchSize=8):
        model = SegformerForSemanticSegmentation.from_pretrained(modelPath)
        model.to(self.device).eval()

        transform = A.Compose([
            A.Resize(imgSize, imgSize),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ])

        fnames = sorted(os.listdir(self.framesDir), key=lambda x: int(x.split("_")[1].split(".")[0]))
        prevCenterX = None
        meanHist = None
        meanHistCount = 0

        for batchStart in range(0, len(fnames), batchSize):
            batchFiles = fnames[batchStart:batchStart + batchSize]
            origSizes = []
            tensors = []
            rawImgs = []

            for fname in batchFiles:
                imgBGR = cv2.imread(os.path.join(self.framesDir, fname))
                imgRGB = cv2.cvtColor(imgBGR, cv2.COLOR_BGR2RGB)
                origSizes.append(imgBGR.shape[:2])
                tensors.append(transform(image=imgRGB)["image"])
                rawImgs.append(imgBGR)

            batch = torch.stack(tensors).to(self.device)

            with torch.no_grad():
                logits = model(pixel_values=batch).logits
                if logits.shape[1] > 1:
                    logits = logits[:, 1:2]
                probs = torch.sigmoid(logits).cpu().numpy()

            for i, fname in enumerate(batchFiles):
                idx = fname.split("_")[1].split(".")[0]
                h, w = origSizes[i]
                imgBGR = rawImgs[i]

                frameHist = self.computeGrayHist(imgBGR)

                if meanHist is None:
                    meanHist = frameHist.copy()
                    meanHistCount = 1
                    lightingRejected = False
                else:
                    dist = cv2.compareHist(meanHist, frameHist, cv2.HISTCMP_BHATTACHARYYA)
                    if dist > Threshold:
                        lightingRejected = True
                    else:
                        lightingRejected = False
                        meanHist = (meanHist * meanHistCount + frameHist) / (meanHistCount + 1)
                        meanHistCount += 1

                barMask = (probs[i, 0] > threshold).astype(np.uint8)
                barMask = cv2.resize(barMask, (w, h), interpolation=cv2.INTER_NEAREST)

                cols = np.where(barMask == 1)[1]
                currentCenterX = int(cols.mean()) if len(cols) > 0 else None

                directionRejected = False
                if currentCenterX is not None and prevCenterX is not None:
                    if self.direction == "right" and currentCenterX <= prevCenterX:
                        directionRejected = True
                    elif self.direction == "left" and currentCenterX >= prevCenterX:
                        directionRejected = True

                if not directionRejected and currentCenterX is not None:
                    prevCenterX = currentCenterX

                coords = np.argwhere(barMask == 1).tolist()
                prefix = "barMask"
                if directionRejected:
                    prefix += "_x"
                if lightingRejected:
                    prefix += "_h"

                savePath = os.path.join(self.barMasksDir, f"{prefix}_{idx}.json")
                with open(savePath, "w") as f:
                    json.dump({"coordinates": coords}, f)

    def computeHeatmap(self):
        allRows = []

        maskFiles = sorted(
            [
                f for f in os.listdir(self.barMasksDir)
                if f.startswith("barMask_") and "_x_" not in f and "_h_" not in f
            ],
            key=lambda x: int(x.replace("barMask_", "").replace(".json", ""))
        )

        for fname in maskFiles:
            with open(os.path.join(self.barMasksDir, fname)) as f:
                data = json.load(f)
            coords = data["coordinates"]
            if not coords:
                continue

            coords = np.array(coords)
            h = coords[:, 0].max() + 1
            rowCounts = np.zeros(h, dtype=np.float32)
            for r in range(h):
                rowCounts[r] = np.sum(coords[:, 0] == r)

            allRows.append(rowCounts)

        if not allRows:
            return

        maxLen = max(len(r) for r in allRows)
        padded = np.array([np.pad(r, (0, maxLen - len(r))) for r in allRows])

        np.save(os.path.join(self.outputDir, "heatmapData.npy"), padded)

        resized = cv2.resize(padded, (HEATMAP_W, HEATMAP_H), interpolation=cv2.INTER_LINEAR)
        smoothed = gaussian_filter(resized, sigma=(4, 9))
        normed = smoothed / (smoothed.max() + 1e-8)
        colormap = plt.get_cmap("jet")
        heatmapImg = (colormap(normed)[:, :, :3] * 255).astype(np.uint8)
        heatmapImg = cv2.cvtColor(heatmapImg, cv2.COLOR_RGB2BGR)
        cv2.imwrite(os.path.join(self.outputDir, "heatmap.png"), heatmapImg)


def mergeHeatmaps(left2rightHeatmap, right2leftHeatmap, outputDir="output"):
    left = cv2.imread(left2rightHeatmap)
    right = cv2.imread(right2leftHeatmap)

    left = cv2.resize(left, (1024, 512))
    right = cv2.resize(right, (1024, 512))

    cv2.putText(left, "Left to Right", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(right, "Right to Left", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    merged = np.hstack([left, right])
    savePath = os.path.join(outputDir, "mergedHeatmap.png")
    cv2.imwrite(savePath, merged)


def generateMaskedVideo(framesDir, barMasksDir, outputPath, fps=25, crf=28, preset="fast"):
    frameFiles = sorted(
        [f for f in os.listdir(framesDir) if f.lower().endswith((".jpg", ".jpeg", ".png"))],
        key=lambda x: int(re.search(r"(\d+)", x).group(1))
    )
    if not frameFiles:
        return

    maskIndex = {}
    for fname in os.listdir(barMasksDir):
        if not fname.endswith(".json"):
            continue
        stem = fname.replace(".json", "")
        parts = stem.split("_")
        idx = int(parts[-1])
        isDirRejected = "_x_" in fname
        isHistRejected = "_h_" in fname
        maskIndex[idx] = (os.path.join(barMasksDir, fname), isDirRejected, isHistRejected)

    probe = cv2.imread(os.path.join(framesDir, frameFiles[0]))
    H, W = probe.shape[:2]

    os.makedirs(os.path.dirname(outputPath) if os.path.dirname(outputPath) else ".", exist_ok=True)
    ffmpegCmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{W}x{H}", "-pix_fmt", "bgr24",
        "-r", str(fps), "-i", "-",
        "-c:v", "libx265",
        "-crf", str(crf),
        "-preset", preset,
        "-tag:v", "hvc1",
        outputPath
    ]
    pipe = subprocess.Popen(ffmpegCmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    ALPHA_MASK = 0.45
    ALPHA_PURPLE = 0.50
    GREEN = np.array([0, 200, 0], dtype=np.float32)
    RED = np.array([0, 0, 200], dtype=np.float32)
    PURPLE = np.array([180, 0, 180], dtype=np.float32)

    for fname in frameFiles:
        frameIdx = int(re.search(r"(\d+)", fname).group(1))
        imgBGR = cv2.imread(os.path.join(framesDir, fname))
        if imgBGR is None:
            continue

        canvas = imgBGR.astype(np.float32)

        if frameIdx in maskIndex:
            maskPath, isDirRejected, isHistRejected = maskIndex[frameIdx]

            if isHistRejected:
                purpleLayer = np.full_like(canvas, PURPLE)
                canvas = cv2.addWeighted(canvas, 1.0 - ALPHA_PURPLE, purpleLayer, ALPHA_PURPLE, 0)
            else:
                with open(maskPath) as f:
                    coords = json.load(f)["coordinates"]

                if coords:
                    coords = np.array(coords)
                    maskImg = np.zeros((H, W), dtype=np.uint8)

                    rows = np.clip(coords[:, 0], 0, H - 1)
                    cols = np.clip(coords[:, 1], 0, W - 1)
                    maskImg[rows, cols] = 1

                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                    maskImg = cv2.dilate(maskImg, kernel, iterations=1)

                    colour = RED if isDirRejected else GREEN
                    colourLayer = np.zeros_like(canvas)
                    colourLayer[maskImg == 1] = colour

                    blended = cv2.addWeighted(canvas, 1.0 - ALPHA_MASK, colourLayer, ALPHA_MASK, 0)
                    maskBool = maskImg.astype(bool)
                    canvas[maskBool] = blended[maskBool]

        frameOut = np.clip(canvas, 0, 255).astype(np.uint8)
        pipe.stdin.write(frameOut.tobytes())

    pipe.stdin.close()
    pipe.wait()


def readFileBytes(path):
    with open(path, "rb") as f:
        return f.read()


def buildMultipart(parts, boundary):
    body = b""
    for name, data, contentType, filename in parts:
        if data is None:
            continue
        disposition = f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'
        body += f"--{boundary}\r\n".encode()
        body += f"{disposition}\r\n".encode()
        body += f"Content-Type: {contentType}\r\n\r\n".encode()
        body += data
        body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    return body


def runPipeline(videoPath, direction, outputDir):
    pipeline = VideoPipeline(videoPath=videoPath, direction=direction, outputDir=outputDir)
    pipeline.extractFrames()
    if not pipeline.validateFrames(modelPath="models/best_segformer_b0_lightbar"):
        return None
    pipeline.runSegmentation(modelPath="models/best_segformer_b0_lightbar")
    pipeline.computeHeatmap()
    return pipeline


@app.post("/api/Samples/maps")
async def processSamples(
    left2right: UploadFile = File(...),
    right2left: UploadFile = File(...)
):
    os.makedirs("/app/vids", exist_ok=True)
    os.makedirs("/app/output", exist_ok=True)

    lrVideoPath = "/app/vids/left2right.mp4"
    rlVideoPath = "/app/vids/right2left.mp4"

    with open(lrVideoPath, "wb") as f:
        f.write(await left2right.read())

    with open(rlVideoPath, "wb") as f:
        f.write(await right2left.read())

    lrPipeline = runPipeline(lrVideoPath, "right", "/app/output/left2right")
    rlPipeline = runPipeline(rlVideoPath, "left", "/app/output/right2left")

    lrVideoBytes = None
    lrHeatmapBytes = None
    rlVideoBytes = None
    rlHeatmapBytes = None
    fullMapBytes = None

    if lrPipeline is not None:
        generateMaskedVideo(
            framesDir=lrPipeline.framesDir,
            barMasksDir=lrPipeline.barMasksDir,
            outputPath="/app/output/left2right/masked_video.mkv"
        )
        lrVideoBytes = readFileBytes("/app/output/left2right/masked_video.mkv")
        lrHeatmapBytes = readFileBytes("/app/output/left2right/heatmap.png")

    if rlPipeline is not None:
        generateMaskedVideo(
            framesDir=rlPipeline.framesDir,
            barMasksDir=rlPipeline.barMasksDir,
            outputPath="/app/output/right2left/masked_video.mkv"
        )
        rlVideoBytes = readFileBytes("/app/output/right2left/masked_video.mkv")
        rlHeatmapBytes = readFileBytes("/app/output/right2left/heatmap.png")

    if lrPipeline is not None and rlPipeline is not None:
        mergeHeatmaps(
            left2rightHeatmap="/app/output/left2right/heatmap.png",
            right2leftHeatmap="/app/output/right2left/heatmap.png",
            outputDir="/app/output"
        )
        fullMapBytes = readFileBytes("/app/output/mergedHeatmap.png")

    return JSONResponse({
        "trackingVideos": {
            "left2right": base64.b64encode(lrVideoBytes).decode() if lrVideoBytes else None,
            "right2left": base64.b64encode(rlVideoBytes).decode() if rlVideoBytes else None,
        },
        "maps": {
            "left2right":  base64.b64encode(lrHeatmapBytes).decode() if lrHeatmapBytes else None,
            "right2left":  base64.b64encode(rlHeatmapBytes).decode() if rlHeatmapBytes else None,
            "fullMap":     base64.b64encode(fullMapBytes).decode()    if fullMapBytes    else None,
        }
    })
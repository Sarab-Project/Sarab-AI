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

HEATMAP_W = 1024
HEATMAP_H = 512

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
        print(f"extracted {count - 1} frames")

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

        print(f"segmented {len(fnames)} frames")
        model = SegformerForSemanticSegmentation.from_pretrained(modelPath)
        model.to(self.device).eval()

        transform = A.Compose([
            A.Resize(imgSize, imgSize),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ])

        fnames = sorted(os.listdir(self.framesDir), key=lambda x: int(x.split("_")[1].split(".")[0]))
        prevCenterX = None

        for batchStart in range(0, len(fnames), batchSize):
            batchFiles = fnames[batchStart:batchStart + batchSize]
            origSizes = []
            tensors = []

            for fname in batchFiles:
                imgBGR = cv2.imread(os.path.join(self.framesDir, fname))
                imgRGB = cv2.cvtColor(imgBGR, cv2.COLOR_BGR2RGB)
                origSizes.append(imgBGR.shape[:2])
                tensors.append(transform(image=imgRGB)["image"])

            batch = torch.stack(tensors).to(self.device)

            with torch.no_grad():
                logits = model(pixel_values=batch).logits
                if logits.shape[1] > 1:
                    logits = logits[:, 1:2]
                probs = torch.sigmoid(logits).cpu().numpy()

            for i, fname in enumerate(batchFiles):
                idx = fname.split("_")[1].split(".")[0]
                h, w = origSizes[i]

                barMask = (probs[i, 0] > threshold).astype(np.uint8)
                barMask = cv2.resize(barMask, (w, h), interpolation=cv2.INTER_NEAREST)

                cols = np.where(barMask == 1)[1]
                currentCenterX = int(cols.mean()) if len(cols) > 0 else None

                rejected = False
                if currentCenterX is not None and prevCenterX is not None:
                    if self.direction == "right" and currentCenterX <= prevCenterX:
                        rejected = True
                    elif self.direction == "left" and currentCenterX >= prevCenterX:
                        rejected = True

                if not rejected and currentCenterX is not None:
                    prevCenterX = currentCenterX

                coords = np.argwhere(barMask == 1).tolist()
                if rejected:
                    savePath = os.path.join(self.barMasksDir, f"barMask_x_{idx}.json")
                else:
                    savePath = os.path.join(self.barMasksDir, f"barMask_{idx}.json")

                with open(savePath, "w") as f:
                    json.dump({"coordinates": coords}, f)

        print(f"segmented {len(fnames)} frames")

    def validateFrames(self, modelPath, numSamples=3, imgSize=512):
        fnames = sorted(
            os.listdir(self.framesDir),
            key=lambda x: int(x.split("_")[1].split(".")[0])
        )
        if len(fnames) == 0:
            print("no frames found")
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
                print(f"mask found in sample {fname}")
            else:
                print(f"no mask in sample {fname}")

        if not anyMaskFound:
            print("none of the sampled frames produced a mask — pipeline stopped")
            return False

        print("validation passed")
        return True

    def computeGrayHist(self, imgBGR):
        gray = cv2.cvtColor(imgBGR, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        cv2.normalize(hist, hist)
        return hist


    def computeHeatmap(self):
        allRows = []

        maskFiles = sorted(
            [f for f in os.listdir(self.barMasksDir) if f.startswith("barMask_") and "_x_" not in f],
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
            print("no accepted masks found")
            return

        maxLen = max(len(r) for r in allRows)
        padded = np.array([np.pad(r, (0, maxLen - len(r))) for r in allRows])

        np.save(os.path.join(self.outputDir, "heatmapData.npy"), padded)

        resized = cv2.resize(padded, (HEATMAP_W, HEATMAP_H), interpolation=cv2.INTER_LINEAR)

        smoothed = gaussian_filter(resized, sigma=(5, 9))

        normed = smoothed / (smoothed.max() + 1e-8)
        colormap = plt.get_cmap("jet")
        heatmapImg = (colormap(normed)[:, :, :3] * 255).astype(np.uint8)
        heatmapImg = cv2.cvtColor(heatmapImg, cv2.COLOR_RGB2BGR)
        cv2.imwrite(os.path.join(self.outputDir, "heatmap.png"), heatmapImg)

        print(f"heatmap saved: {padded.shape[0]} accepted frames x {padded.shape[1]} rows → resized to {HEATMAP_W}x{HEATMAP_H}")


pipeline = VideoPipeline(
    videoPath="vids/lr(2).MOV",
    direction="right",
    outputDir="output"
)

pipeline.extractFrames()
pipeline.runSegmentation(modelPath="models/best_segformer_b0_lightbar")
pipeline.computeHeatmap()
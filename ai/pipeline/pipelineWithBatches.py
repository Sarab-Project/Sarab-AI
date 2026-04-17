import os
import shutil
import cv2
import json
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

    def computeIntersections(self):
        intersectionMasks = {}

        for idx in self.corneaMasks:
            if idx not in self.barMasks:
                print(f"there is no matching bar file for frame {idx}!!!!")
                continue

            corneaMask = self.corneaMasks[idx]
            barMask = self.barMasks[idx]

            if corneaMask.shape != barMask.shape:
                barMask = cv2.resize(barMask, (corneaMask.shape[1], corneaMask.shape[0]), interpolation=cv2.INTER_NEAREST)

            intersection = np.logical_and(corneaMask, barMask).astype(np.uint8)
            intersectionMasks[idx] = intersection
            self.saveMaskJson(intersection, self.intersectionDir, f"intersection_{idx}.json")

        self.intersectionMasks = intersectionMasks

    def computeHorizontalDistance(self):
        disDir = os.path.join(os.path.dirname(self.intersectionDir), "horizontalDis")
        os.makedirs(disDir, exist_ok=True)
        maxDis = 0

        for idx, mask in self.intersectionMasks.items():
            distances = []
            for row in range(mask.shape[0]):
                cols = np.where(mask[row] == 1)[0]
                if len(cols) == 0:
                    continue
                dis = int(cols[-1] - cols[0])
                if dis > 0:
                    distances.append(dis)
                    if dis > maxDis:
                        maxDis = dis

            outputPath = os.path.join(disDir, f"horizontalDis{idx}.json")
            with open(outputPath, "w") as f:
                json.dump({"distances": distances}, f)

        print(f"the maximum horizontal dis across all masks: {maxDis} px")

    def saveMaskJson(self, mask, folder, filename):
        coords = np.argwhere(mask == 1).tolist()
        with open(os.path.join(folder, filename), "w") as f:
            json.dump({"coordinates": coords}, f)

    def loadMaskJson(self, path):
        with open(path) as f:
            data = json.load(f)
        coords = data["coordinates"]
        if not coords:
            return np.zeros((1, 1), dtype=np.uint8)

        coords = np.array(coords)
        h, w = coords[:, 0].max() + 1, coords[:, 1].max() + 1
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[coords[:, 0], coords[:, 1]] = 1
        return mask

if __name__ == "__main__":
    pipeline = VideoPipeline(
        videoPath="vids/s1.mp4",
        outputDir="output"
    )

    pipeline.extractFrames()
    pipeline.runSegmentation(modelPath={
        "cornea": "models/best_segformer_b0_cornea",
        "bar": "models/best_segformer_b0_lightbar"
    })
    pipeline.computeIntersections()
    pipeline.computeHorizontalDistance()
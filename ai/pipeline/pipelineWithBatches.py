import os
import cv2
import json
import numpy as np
import torch
from transformers import SegformerForSemanticSegmentation
import albumentations as A
from albumentations.pytorch import ToTensorV2


class VideoPipeline:
    def __init__(self, videoPath, outputDir="output"):
        self.videoPath = videoPath
        self.framesDir = os.path.join(outputDir, "frames")
        self.corneaDir = os.path.join(outputDir, "segmentedCornea")
        self.barDir = os.path.join(outputDir, "segmentedBar")
        self.intersectionDir = os.path.join(outputDir, "intersection")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.corneaMasks = {}
        self.barMasks = {}

        for d in [self.framesDir, self.corneaDir, self.barDir, self.intersectionDir]:
            os.makedirs(d, exist_ok=True)
    
    def extractFrames(self):
        cap = cv2.VideoCapture(self.videoPath)
        count = 1
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            cv2.imwrite(os.path.join(self.framesDir, f"img_{count}.jpg"), frame)
            count += 1
        cap.release()
        print(f"extracted {count-1} frames")

    def runSegmentation(self, modelPath, threshold=0.5, imgSize=512, batchSize=8):
        corneaModel = SegformerForSemanticSegmentation.from_pretrained(modelPath["cornea"])
        corneaModel.to(self.device).eval()
        barModel = SegformerForSemanticSegmentation.from_pretrained(modelPath["bar"])
        barModel.to(self.device).eval()

        transform = A.Compose([
            A.Resize(imgSize, imgSize),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ])

        fnames = sorted(os.listdir(self.framesDir))

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
                corneaLogits = corneaModel(pixel_values=batch).logits
                if corneaLogits.shape[1] > 1:
                    corneaLogits = corneaLogits[:, 1:2]
                corneaProbs = torch.sigmoid(corneaLogits).cpu().numpy()

                barLogits = barModel(pixel_values=batch).logits
                if barLogits.shape[1] > 1:
                    barLogits = barLogits[:, 1:2]
                barProbs = torch.sigmoid(barLogits).cpu().numpy()

            for i, fname in enumerate(batchFiles):
                idx = os.path.splitext(fname)[0].split("_")[1]
                h, w = origSizes[i]

                corneaMask = (corneaProbs[i, 0] > threshold).astype(np.uint8)
                corneaMask = cv2.resize(corneaMask, (w, h), interpolation=cv2.INTER_NEAREST)
                self.corneaMasks[idx] = corneaMask
                self.saveMaskJson(corneaMask, self.corneaDir, f"segmentedCornea_{idx}.json")

                barMask = (barProbs[i, 0] > threshold).astype(np.uint8)
                barMask = cv2.resize(barMask, (w, h), interpolation=cv2.INTER_NEAREST)
                self.barMasks[idx] = barMask
                self.saveMaskJson(barMask, self.barDir, f"segmentedBar_{idx}.json")

        print(f"segmented {len(fnames)} frames")
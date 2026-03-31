import numpy as np

def transformCorneaCSV(inputPath, outputPath):
    with open(inputPath, 'r') as f:
        lines = f.readlines()

    header = lines[0]
    dataLines = lines[1:]
    rows = []

    for line in dataLines:
        vals = [v.strip() for v in line.strip().split(';') if v.strip()]
        rows.append(vals)

    data = np.array(rows)
    numOfRows = data.shape[1]
    shift = numOfRows//4

    step1 = np.roll(data, -shift, axis=1)
    transformed = step1[:, ::-1]

    with open(outputPath, 'w') as f:
        f.write(header)
        for row in transformed:
            f.write('; '.join(row) + '\n')

    print("done test")




if __name__ == "__main__":
    transformCorneaCSV("mainData.csv", "transformedData.csv")
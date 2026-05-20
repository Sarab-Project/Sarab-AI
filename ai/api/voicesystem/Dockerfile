FROM syrian-medical-api:v1
WORKDIR /app
COPY main.py /app/main.py
RUN pip install python-multipart httpx -q
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

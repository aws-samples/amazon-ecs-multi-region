FROM python:3.9-alpine

RUN adduser -D dev
USER dev
WORKDIR /app

COPY --chown=dev:dev requirements.txt requirements.txt
RUN pip install --user -r requirements.txt
COPY --chown=dev:dev . .

CMD [ "python", "-m" , "flask", "run", "--host=0.0.0.0"]

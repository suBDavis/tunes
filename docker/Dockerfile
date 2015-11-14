FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y \
	python-pip \
	curl

RUN pip install --upgrade pip
RUN pip install flask

ADD . /spotitunes/

CMD alias python=python3
CMD python /spotitunes/app.py
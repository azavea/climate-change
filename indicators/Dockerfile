FROM debian:stable

MAINTAINER Azavea

RUN apt-get -y update && \
    apt-get -y install python python-dev python-pip && \
    apt-get -y autoremove

COPY . /indicators

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

WORKDIR /indicators

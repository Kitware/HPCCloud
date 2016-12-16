FROM ubuntu:16.04
MAINTAINER Chet Nieter <chet.nieter@kitware.com>

#
# Run using the following command in teh
#   docker run -rm -v <path to dir with nwchem output file>:/hpccloud <image_name> <nwchem output file>
#

RUN apt-get -y update && apt-get install -y \
    git \
    python \
&& rm -rf /var/lib/apt/lits/*

RUN mkdir /hpccloud
WORKDIR /hpccloud

RUN git clone https://github.com/wadejong/NWChemOutputToJson.git /opt/NWChemOutputToJson

ENTRYPOINT ["python", "/opt/NWChemOutputToJson/NWChemJsonConversion.py"]
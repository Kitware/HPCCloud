FROM ubuntu:16.04
MAINTAINER Chet Nieter <chet.nieter@kitware.com>

#
# Run using docker run -rm -v <path to dir wiht nwchem_run.out file>:/hpccloud <image_name>
#

RUN apt-get -y update && apt-get install -y \
    git \
    python \
&& rm -rf /var/lib/apt/lits/*

RUN mkdir /hpccloud
WORKDIR /hpccloud

RUN git clone https://github.com/wadejong/NWChemOutputToJson.git /opt/NWChemOutputToJson

CMD ["python", "/opt/NWChemOutputToJson/NWChemJsonConversion.py", "/hpccloud/nwchem_run.out"]
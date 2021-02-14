FROM debian:buster-slim

ENV LANG=en_EN.UTF-8

#Set up prerequisites for downloading qgis
RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests --allow-unauthenticated -y \
        gnupg \
        software-properties-common \
        ca-certificates \
        wget \
        locales \
    && localedef -i en_US -f UTF-8 en_US.UTF-8 \
    # Add the current key for package downloading - As the key changes every year at least
    # Please refer to QGIS install documentation and replace it with the latest one
    && wget -qO - https://qgis.org/downloads/qgis-2020.gpg.key | gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/qgis-archive.gpg --import \
    && chmod a+r /etc/apt/trusted.gpg.d/qgis-archive.gpg \
    && add-apt-repository "deb https://qgis.org/debian `lsb_release -c -s` main" \
	# Update and install qgis components
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests --allow-unauthenticated -y \
        qgis-server \
        python-qgis \
        spawn-fcgi \
        xauth \
        xvfb \
    && apt-get remove --purge -y \
        gnupg \
        software-properties-common \
        wget \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m qgis

ENV TINI_VERSION v0.17.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

ENV QGIS_PREFIX_PATH /usr
ENV QGIS_SERVER_LOG_STDERR 1
ENV QGIS_SERVER_LOG_LEVEL 2

COPY cmd.sh /home/qgis/cmd.sh
RUN chmod -R 777 /home/qgis/cmd.sh
RUN chown qgis:qgis /home/qgis/cmd.sh

USER qgis
WORKDIR /home/qgis

ENTRYPOINT ["/tini", "--"]

CMD ["/home/qgis/cmd.sh"]
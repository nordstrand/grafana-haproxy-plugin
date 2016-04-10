FROM alpine:3.3
RUN apk add --update apache2 apache2-proxy && rm -rf /var/cache/apk/*
ADD provision/httpd.conf /etc/apache2



ENTRYPOINT ["/usr/sbin/httpd"]
CMD ["-DFOREGROUND"]

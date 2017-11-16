# Dockerfile
# publish a static server to nginx

FROM nginx:alpine
COPY . /usr/share/nginx/html


FROM public.ecr.aws/lambda/python:3.8 as ffmpeg
RUN yum -y update
RUN yum -y install git && yum -y install wget && yum -y install tar.x86_64 && yum -y install xz && yum clean all
RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
RUN tar -xvf ffmpeg-release-amd64-static.tar.xz
RUN mv ff*/ffmpeg /ffmpeg

FROM public.ecr.aws/lambda/python:3.12
COPY --from=ffmpeg /ffmpeg ${LAMBDA_TASK_ROOT}/ffmpeg
RUN chmod +x ${LAMBDA_TASK_ROOT}/ffmpeg
RUN ln -s ${LAMBDA_TASK_ROOT}/ffmpeg /usr/bin/ffmpeg

# Copy function code
COPY __init__.py ${LAMBDA_TASK_ROOT}/app.py

CMD [ "app.lambda_handler" ] 
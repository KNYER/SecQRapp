from LSBSteg import *
import cv2
import datetime
import sys

file = sys.argv[1]
id = sys.argv[2]

"""LSB Steg embeding"""
steg = LSBSteg(cv2.imread("upload/" + file))

dandt =  datetime.datetime.now()
date_time_str = dandt.strftime("%Y-%m-%d %H:%M:%S")
message = str(str(id) + " " + date_time_str)
img_encoded = steg.encode_text(message)
print(id,dandt)
cv2.imwrite("upload/"+ file, img_encoded)

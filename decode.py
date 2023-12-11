from LSBSteg import *
import cv2
from pyzbar.pyzbar import decode 
import sys

if len(sys.argv) > 1:
    id = sys.argv[1]
  
    
"""Decryption and decoding of QR code and the embed hidden message. Note Authentication feature to be added """
def get_urldec():
    image = cv2.imread('upload/'+ id)
    decoded_results = decode(image)
    if decoded_results:
        urldec = decoded_results[0][0].decode('utf-8')
        im = cv2.imread("upload/"+ id)
        steg = LSBSteg(im)
        stgmsg = steg.decode_text()
        print(urldec,stgmsg)
    else:
        urldec = "No_QR_code_found"
        
        print(urldec)
    

get_urldec()


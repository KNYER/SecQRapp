from LSBSteg import *
import cv2
import sys
if len(sys.argv) > 1:
    file = sys.argv[1]
directory = "upload/"+ file  
"""Read the hidden data to be sent to dbwrite """
def get_urldec():
    im = cv2.imread(directory)
    steg = LSBSteg(im)
    stgmsg = steg.decode_text()
        
    print(stgmsg)

get_urldec()

#!/usr/bin/python
# This class takes care of requests to the Betaface API for facial
# recognition after the user's pictures are saved.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

import argparse
import json
import pymongo
import os
import requests
import time

BASE_API_URL = "https://betaface.p.mashape.com/%s"

class BetafaceApi():
  def __init__(self, key, uploads_url):
    """
    Constructor for a BetafaceApi class, this should never be called except for
    unit testing.
    """
    self.key = key
    self.uploads_url = uploads_url

    self.headers = {
      "X-Mashape-Key": self.key,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    }

  @staticmethod
  def create(uploads_url):
    """
    Factory method to create a BetafaceApi class.
    """
    key = os.environ.get("BETAFACE_API_KEY", None)
    if not key:
      raise EnvironmentError("Did you forget to . ./workspace.sh you bumbus?")
    return BetafaceApi(key, uploads_url)

  def upload_image(self, image, single=True):
    """
    Uploads a given image to the Betaface queue for processing and returns the
    UID of the image, or None if the upload failed.

    Parameters:
      image: string, the name of the image to upload

    Returns:
      string or None
    """
    url = BASE_API_URL % "UploadImage"
    data = {
      "detection_flags": "bestface,propoints" if single else "propoints",
      "url": self.uploads_url + image
    }
    response = requests.post(url, headers=self.headers, data=data).json()
    if response.get("int_response", 1) == 0:
      return response.get("img_uid")
    return None

  def get_image_info(self, img_uid):
    """
    This function returns all important information pertaining to the given
    image uid, including faces detected.

    Parameters:
      img_uid: string, the id of the image to get information on

    Returns:
      string
    """
    url = BASE_API_URL % "GetImageInfo"
    data = {
      "img_uid": img_uid
    }
    response = requests.post(url, headers=self.headers, data=data).json()
    while response.get("int_response") == 1:
      time.sleep(1);
      response = requests.post(url, headers=self.headers, data=data).json()
    return response

  def set_face_uids_to_person(self, face_uids, username):
    """
    This function sets the given face_uids to the given namespace and returns
    True upon success. Note that each unique face uid can only have one
    namespace, so setting a uid's namespace to "" will remove it from its
    original namespace. This will be necessary if a user decide to update their
    selfies and we must remove the original selfie from their namespace.

    Parameters:
      face_uids: [string], a list of uids to assign
      namespace: string, the namespace to assign the uids to

    Returns:
      boolean
    """
    url = BASE_API_URL % "SetPerson"
    data = {
      "faces_uids": ",".join(face_uids),
      "person_id": "%s@snapshot" % username
    }
    response = requests.post(url, headers=self.headers, data=data).json()
    return response.get("int_response", 1) == 0

  def queue_face_recognition_request(self, face_uid, username):
    """
    This function sends a request to check a face uid against a trained
    namespace and returns the recognition request id.

    Parameters:
      face_uid: string, the face_uid to recognize
      username: string, the person to match the face against

    Returns:
      string
    """
    url = BASE_API_URL % "RecognizeFaces"
    data = {
      "faces_uids": face_uid,
      "targets": "%s@snapshot" % username
    }
    response = requests.post(url, headers=self.headers, data=data).json()
    return response.get("recognize_uid", None)

  def get_recognition_result(self, recognition_request_uid):
    """
    This function gets the result of a queued face recognition request
    given the id of the recognition request. We have a predefined threshold that
    determines whether or not it is a match.

    Parameters:
      recognition_request_id: string, the id of the queued recognition request

    Returns:
      boolean
    """
    url = BASE_API_URL % "GetRecognizeResult"
    data = {
      "recognize_uid": recognition_request_uid
    }
    response = requests.post(url, headers=self.headers, data=data).json()
    if response.get("int_response", 1) == 1:
      time.sleep(1)
      response = requests.post(url, headers=self.headers, data=data).json()
    return response

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Runs the BetafaceApi test cases")
  parser.add_argument("--uploads_url",
                      default="http://snapshot.sytes.net/uploads/")
  args = parser.parse_args()
  api = BetafaceApi.create(args.uploads_url)
  # imguid1 = api.upload_image("asdf_0.jpg")
  # imguid2 = api.upload_image("asdf_1.jpg")
  # print imguid1, imguid2
  # info1 = api.get_image_info(imguid1)
  # info2 = api.get_image_info(imguid2)
  # print info1, info2
  # faceid1 = info1["faces"][0]["uid"]
  # faceid2 = info2["faces"][0]["uid"]
  faceid1 = "2b26b998-c04b-11e5-a418-001c420bd602"
  faceid2 = "8f3b1b83-c2e9-11e5-a418-001c420bd602"
  print faceid1, faceid2
  print api.set_face_uids_to_person([faceid1], "testspace")
  r = api.queue_face_recognition_request(faceid2, "testspace")
  print r
  print api.get_recognition_result(r)

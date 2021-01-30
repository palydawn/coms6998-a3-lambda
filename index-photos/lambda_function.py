from requests_aws4auth import AWS4Auth
import boto3
import requests

def detect_labels(photo, bucket):

    client=boto3.client('rekognition')

    response = client.detect_labels(Image={'S3Object':{'Bucket':bucket,'Name':photo}},
        MaxLabels=10)

    print('Detected labels for ' + photo)
    labels = []
    for label in response['Labels']:
        labels.append(label['Name'])
    print(labels)
    return labels


def lambda_handler(event, context):
    # The domain with https:// and trailing slash. For example, https://my-test-domain.us-east-1.es.amazonaws.com/
    host = 'https://vpc-photos-owcvu6ex4q3ap3sgeav4ochzfm.us-east-1.es.amazonaws.com/'
    path = 'photos/_doc/' # the Elasticsearch API endpoint
    region = 'us-east-1' # For example, us-west-1
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
    url = host + path
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        photo = record['s3']['object']['key']
        labels = detect_labels(photo, bucket)
        payload = {
            "objectKey": photo,
            "bucket": bucket,
            "createdTimestamp": record["eventTime"],
            "labels": labels
        }
        r = requests.post(url, auth=awsauth, json=payload) # requests.get, post, and delete have similar syntax
        print(r.text)

    return {
        'statusCode': 200,
        'body': 'get new image'
    }

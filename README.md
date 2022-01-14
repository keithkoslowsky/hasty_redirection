## About

A simple URL redirector based on a static CSV file that is source controlled. The program generates a "compiled" version of the redirector based on the CSV so that there are no dependencies at all (database, services, or third party) and it will run in constant time.

## AWS

Create/Update:

* Note: Switch to which Region you want in AWS. This will need to be the same for all the steps below.

1. Create a certificate in ACM and get the ARN from it. Only need to do this on create and not for future updates. (https://us-east-2.console.aws.amazon.com/acm/home?region=us-east-2)[ACM]. (https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)[More info] on how to get a certificate in ACM.

2. Open CloudFormation and Create Stack. Template Is Ready->Upload a template file. Chose the file in `infastructure/aws/S3.cloudformation`. Click next and name your stack `HastyRedirection-S3`.

Enter your parameters:

```
BucketName: Name of the bucket that you will upload your source code to. It must not exist yet. This script will create it for you. Example: my-hastyredirection-bucket. Required.
LoggingBucketName: Name of the logging bucket. Any requests made to BucketName for assets will be logged here. Must not exist yet. Optional but a good idea.
```

Click Next and accept all the defaults for the rest of the settings in CloudFormation to create the stack. 

3. Create a CSV of your redirects in config/redirects.csv. One redirect per line. In the format slug|where_to_redirect|status_code...example: `foobar|https://www.google.com|302` Let's say your domain was example.com, then if someone visits your slug foobar, then a visit to https://example.com/foobar will redirect them to https://www.google.com and have the status code be 302.

4. Make a config (optional) in config/settings.txt. Valid variable is:
  `default_status_code=302` - If you don't specify a status code in your csv, then `default_status_code` will be used instead. If this isn't specified, then it defaults to 301.


5. Install dependencies...`docker run -it -v $PWD:$PWD -w $PWD node:14 npm install`. Then run `docker run -it -e PROVIDER=AWS -v $PWD:$PWD -w $PWD node:14 node src/compile.js` which will compile and zip up your source code into HastyRedirection.zip in the root directory.

6. Upload that zip file to your S3 bucket. All normal defaults is fine...should make the file private!

7. Open CloudFormation and Create Stack again. Template Is Ready->Upload a template file. Chose the file in `infastructure/aws/infastructure.cloudformation`. Click next and name your stack. Name it HastyRedirection-Gateway. Enter your parameters:

```
CertArn: Get the CertArn from step 1. Optional.
DeploymentType: To get started, choose AllAtOnce. If there are updates in the future, it would be a good idea to implement either a linear or canary option as if there was an error in the source code, not everyone will see that error right away. 
DomainName: The domain name that you used for your certificate in step #1. Optional.
Filename: The name of the zip file that you uploaded. This must be unique every time that you update this CloudFormation template. When you run do step #5, it creates a versioned file for you.
```

After you enter all the defaults, click Next and accept all the rest of the defaults on the pages. Accept the three checkboxes that AWS will do things on your behalf. Once submitted, AWS will build the infastructure for Hasty Redirection.

Click the refresh icon to get updates and wait for it to complete.

  If you specified a DomainName then click on the Outputs tab. If you have specified a DomainName then note the API Gateway URL. If you visit that URL and then a slug that you had in your redirects file then it should work. Note, the DomainName will NOT work yet as you need to update your DNS. You will need to click on the Resources tab. Find the `ApiHttpApiGateway` and click it's Physical ID. Now click Custom Domains and then select your domain. In the Configuration tab there is an API Gateway domain name. This is the DNS value that you need to create in your DNS provider. For example, if your DomainName was shortener.example.com then you will want to create a CNAME record for shortener.example.com and the value will be the API Gateway domain name. Once you add the DNS, wait a few minutes, then test out your domain name with a slug and you should be all set!
  If you did not specify a DomainName then click on the Resources tab and scroll to the ServerlessHttpApi Logical ID and click Physical ID link. Click into it and you can get your URL by getting the Invoke URL. 

* Note any updates to the redirects.csv, the config, or any source code updates will need to run all the above steps in order again.
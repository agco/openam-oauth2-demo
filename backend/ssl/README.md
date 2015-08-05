SSL magic
=========

Some servers use SSL certs from CAs that are not recognized by NodeJS, resulting in `UNABLE_TO_VERIFY_LEAF_SIGNATURE` exception
when `passport-oauth2` is trying to obtain access token.

To solve that we use a very nice module that injects the CA certificates into chain used by NodeJS:

```
require('ssl-root-cas')
    .inject()
    .addFile(__dirname + '/../DigiCertHighAssuranceEVRootCA.pem')
    .addFile(__dirname + '/../DigiCertSHA2HighAssuranceServerCA.pem');
```

Now the tricky part is how I got those PEMs.

## 1. Fetch hosts cert:

    openssl s_client -showcerts -connect serverWithCheapSSLCert:443 </dev/null 2>/dev/null > serverWithCheapSSLCert.pem

## 2. Read who issued the cert:

    openssl x509 -in serverWithCheapSSLCert.pem -text -noout

You should see something like

    CA Issuers - URI:http://cacerts.digicert.com/DigiCertSHA2HighAssuranceServerCA.crt

## 3. Download issuer cert

    wget http://cacerts.digicert.com/DigiCertSHA2HighAssuranceServerCA.crt

## 4. Convert DER to PEM

    openssl x509 -inform der -in DigiCertSHA2HighAssuranceServerCA.crt -out DigiCertSHA2HighAssuranceServerCA.pem

## 5. Read who issued that cert
    openssl x509 -in DigiCertSHA2HighAssuranceServerCA.pem -text -noout

You should see somethig like

    Issuer: C=US, O=DigiCert Inc, OU=www.digicert.com, CN=DigiCert High Assurance EV Root CA

So the issuer is 'DigiCert High Assurance EV Root CA'. Ok where to get that? Go to https://www.digicert.com/digicert-root-certificates.htm and find right one
I found it under https://www.digicert.com/CACerts/DigiCertHighAssuranceEVRootCA.crt

## 6. Download DigiCertHighAssuranceEVRootCA.crt

    wget https://www.digicert.com/CACerts/DigiCertHighAssuranceEVRootCA.crt

## 7. Convert DER to PEM

    openssl x509 -inform der -in DigiCertHighAssuranceEVRootCA.crt -out DigiCertHighAssuranceEVRootCA.pem

It was a painful lesson to figure this all out.

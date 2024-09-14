You can log into stripe throught the cli and forward events so your computer can act as a webhook for testing purposes.
```
stripe login

stripe listen --forward-to localhost:4242/webhook

stripe trigger payment_intent.succeeded
```

TEST CARD NUMBER: 4242424242424242
TEST CARD NUMBER FOR 3D SECURE CHALLANGE FLOW (EU): 4000002500003155
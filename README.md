# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deploying to Firebase App Hosting

To deploy this application without using the GitHub integration in the Firebase Console, you can use the Firebase Command Line Interface (CLI) directly from your terminal. This is the recommended method for bypassing issues with the GitHub connection.

### Step 1: Install the Firebase CLI

If you don't have it installed already, open your terminal and run the following command:

```bash
npm install -g firebase-tools
```

### Step 2: Log in to Firebase

Next, log in to your Firebase account. This will open a browser window for you to authenticate.

```bash
firebase login
```

### Step 3: Initialize App Hosting

Now, link this project directory to your Firebase project. Run the `init` command and select **App Hosting**.

```bash
firebase init apphosting
```

You will be prompted to select the Firebase project you want to deploy to. Make sure you choose the same project you were using in the Firebase Console.

### Step 4: Deploy Your App

Finally, build and deploy your application.

```bash
firebase deploy
```

This command will build your Next.js application and upload it to Firebase App Hosting. Once it's finished, it will provide you with the URL to your live site.

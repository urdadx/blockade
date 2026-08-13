# What the project is about

Blockade is a chrome extension that blocks distracting websites

# How it works

We already have a list of websites based on categories as seen in @apps/web/src/data/block-categories. when the user visits a website and its in the list of block websites. the user is automatically redirected to /redirect page as fast as possible.

However, when the user visits a website that is not inside the blocked list. on the chrome extension. we show the website favicon and name, and a button that says block this site.

When the user clicks on the block this site, the website is added to the blocklist.

# No User accounts/login

The user does not need an account, everything is local on their PC.
Now the question i have is,

- How do we store their block lists because users can edit their block site. ie. remove and add new ones from the dashboard /routes/block-list.tsx. since there are no user accounts, how will we do that.

# Srishti's New Blog

# Setup

1. Install [hugo](https://gohugo.io/getting-started/installing/#homebrew-macos):

    ```
        brew install hugo
    ```

2. Fork and clone the [main repo](https://github.com/swapsha96/academic-kickstart):

    ```
    git clone https://github.com/<your-username>/academic-kickstart.git
    cd academic-kickstart
    git submodule update --init --recursive
    ```

3. Run the jekyll app locally:

    ```
    hugo server
    ```

The app is now running at <https://localhost:1313>.


4. In your `config.toml` file, set `baseurl = "https://<USERNAME>.github.io/"` (in this case, set `baseurl = "https://https://srishti.dev/"`). Stop Hugo if it’s running and delete the `public` directory if it exists (by typing `rm -r public/`).

5. Run the following commands to link your blog to blog repo:

 ```
git submodule add -f -b master https://github.com/<USERNAME>/<USERNAME>.github.io.git public
cd public
git add .
git commit -m "Initial commit"
git push -u origin master
 ```
 
 6. Next, regenerate your website’s HTML code by running Hugo and uploading the public submodule to GitHub:
 ```
cd ..
hugo
cd public
git add .
git commit -m "Build website"
git push origin master
cd ..
```

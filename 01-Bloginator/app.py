# imports

from flask import Flask, render_template, request, session, redirect, url_for,Markup
import sqlite3, utils

from functools import wraps
from time import time

#flask
app = Flask(__name__)

def debug(fn):
    @wraps(fn)
    def wrapped_fn(*args, **kwargs):
        start_time = time()
        print "%s%s" % (fn.func_name, args)
        with open("logfile.log", "a") as f:
            f.write("%s%s%s\n" % (fn.func_name, args, kwargs))
        result = fn(*args, **kwargs)
        print "Runtime of %s: %s" % (fn.func_name, (time() - start_time))
        return result
    return wrapped_fn

#link to the index; just a render_template & login
@app.route("/", methods=["GET","POST"])
@app.route("/home", methods=["GET","POST"])
@debug
def home():
    if 'un' in session and session['un'] != 0:
        return render_template("home.html",un=session['un'])
    else:
        return login_register()


@app.route("/<id>")
@debug
def test(id):
    return id


#link to the about page; just a render_template
@app.route("/about")
def about():
    if 'un' in session and session['un'] != 0:
        return render_template("about.html",un=session['un'])
    else:
        return render_template("about.html")

#woo cool popup!
@app.route("/login",methods=["GET","POST"])
def login_register():
    if request.method=="GET":
        if 'un' in session and session['un'] != 0:
            user = session['un']
            return redirect(url_for("home"))
        else:
            return render_template("home.html",unlogged="You are not currently logged in.")
    else:
        #button = request.form['button']
        if 'in_username' in request.form:
            user = request.form['in_username']
            passwd = request.form['in_password']
            if utils.authenticate(user,passwd):
                session['un'] = user
                session['pw'] = passwd
                return redirect(url_for("blog"))
            else:
                error = "INVALID USERNAME AND/OR PASSWORD"
                return render_template("home.html",error=error)
        else:
            user = request.form['regis_username']
            passwd = request.form['regis_password']
            conn = sqlite3.connect('bloginator.db')
            c = conn.cursor()
            c.execute('select * from users where username="'+user+'"')
            r = c.fetchall()
            conn.commit()
            if len(r) == 0:
                utils.newUser(user,passwd)
                success = "Account Created!"
                session['un'] = user
                session['pw'] = passwd
                return redirect(url_for("blog"))
            else:
                failure = "There is already an account with this username"
                return render_template("home.html",created=failure)

# reset the username & pw in the session
@app.route("/logout")
def logout():
    session['un'] = 0
    session['pw'] = 0
    return redirect(url_for("home"))

# view all stories currently posted       
@app.route("/blog", methods=["GET", "POST"])
def blog():
    if request.method=="GET":
        if 'un' not in session or session['un']==0:
            return redirect(url_for("home"))
        else:
            user = session['un']
            s = ""
            stories = utils.getAllPosts()
            for p in stories:
                s += "<br>"
                s += "<div class='boxed2 type center'>"
                s += "<h1> <a href='story/%s'> %s</a> </h1>" %(p[1], p[1])
                s += "<h2> Posted by: %s </h2>" %p[0]
                s += "<h3> %s </h3>" %p[2] + "</div><br>"
            s = Markup(s)
            return render_template("blog.html",un=user,stories=s)
    else:
        ti = request.form["title"]
        con = request.form["post_content"]
        utils.Post(session['un'],ti,con)
        return redirect(url_for("blog"))

#view individual stories
@app.route("/story/<title>", methods=["GET", "POST"])
def story(title=""):
    if request.method=="GET":
        if 'un' not in session or session['un']==0:
            return redirect(url_for("home"))
        else:
            user = session['un']
            story = utils.getPost(title)
            if len(story) == 0:
                return redirect(url_for("blog"))
                #return render_template("home.html")
            else:
                story = story[0]
                return render_template("story.html",un=user,title=story[1],user=story[0],content=story[2])
    else:
        content = request.form['post_content']
        utils.edit(session['un'], title, content)
        return redirect(url_for("profile"))

#delete story
@app.route("/delete/<user>/<title>", methods=["GET", "POST"])
def delete(user="",title=""):
    if 'un' not in session or session['un']==0:
        return redirect(url_for("home"))
    else:
        utils.delete(user, title)
        return redirect(url_for("profile"))


# View your own Profile: display username, and list of post titles
@app.route("/profile")
def profile():
    user = session['un']
    story = utils.getUserPosts(user)
    if len(story) != 0:
        s = ""
        for p in story:
            s += "<h1> <a href='story/%s'> %s</a> </h1><br>" %(p[1], p[1])
        s = Markup(s)
        return render_template("profile.html",un=user,stories=s)
    else:
        return render_template("profile.html",un=user)

# View all Members
@app.route("/members")
def members():
    users = utils.getUsers()
    s = ""
    for u in users:
        s+= "<div type='boxed2 type center'>"
        s+= "%s" %u[0]
        s+= "</div>"
    s = Markup(s)
    if 'un' in session and session['un'] != 0:
        return render_template("members.html",members=s,un=session['un'])
    else:
        return render_template("members.html",members=s)
    
#running
if __name__ == "__main__":
    app.debug = True
    app.secret_key = "whatsthisfor"
    app.run(host='0.0.0.0',port=8000)

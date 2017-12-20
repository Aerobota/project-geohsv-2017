# Starting project using persistent screen session

Screen is a window manager for linux with lots of cool features. For OSH, we can use screen to start an instance and have it continue to run after closing the terminal.

First, start a new screen session from your terminal window. The -S option allows you to give the session a meaningful name:
```
> screen -S sessionName
```

Now, start the OSH instance via the launch script:
```
> ./launch.sh
```

Now you can close the terminal window (detach), and the OSH process will continue to run. To get back to your session, a.k.a. reattach, use the -r option:
```
> screen -r sessionName
```

Note that if you start your process in the background...
```
> ./launch.sh &
```
...do not subsequently use 'exit' to close your terminal. That will terminate the screen session.

There are lots of additional handy features screen provides.  Here are a few references:

https://www.gnu.org/software/screen/manual/screen.html<br>
https://www.rackaid.com/blog/linux-screen-tutorial-and-how-to/<br>
https://www.tecmint.com/screen-command-examples-to-manage-linux-terminals/


|%
+$  writ   [seal memo]
+$  feel   @ta
::
+$  seal
  $:  =time
      feels=(map ship feel)
      replied=(set time)
  ==
::
+$  remark-action
  (pair flag remark-diff)
::
+$  remark-diff
  $%  [%read ~]
      [%read-at p=time]
      [?(%watch %unwatch) ~]
  ==
::
+$  flag  (pair ship term)
+$  diff
  $%  [%add p=memo]
      [%del p=time] 
      [%add-feel p=time q=ship r=feel]
      [%del-feel p=time q=ship]
  ==
::
+$  writs
  ((mop time writ) lte)
++  writs-on
  ((on time writ) lte)
+$  log
  ((mop time diff) lte)
++  log-on
  ((on time diff) lte)
+$  remark
  [last-read=time watching=_| ~]
+$  chat
  [=net =remark =log =writs]
::
+$  content
  (pair (list block) (list inline))
::
+$  block  *
::
+$  inline
  $@  @t
  $%  [%italics p=cord]
      [%bold p=cord]
      [%block p=@ud q=cord]
      [%inline-code p=cord]
      [%code p=cord]
      [%blockquote p=cord]
      [%tag p=cord]
      [%href p=cord]
  ==
::
+$  memo  
  $:  replying=(unit time)
      author=ship
      sent=time
      =content
  ==
::
+$  net
  $~  [%load ~]
  $%  [%sub p=ship]
      [%pub ~] :: TODO: permissions?
      [%load ~]
  ==
::
+$  action
  (pair flag update)
+$  update
  (pair time diff)
+$  logs
  ((mop time diff) lte)
--

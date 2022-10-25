/-  d=diary, g=groups, ha=hark
/-  meta
/+  default-agent, verb, dbug
/+  not=notes
/+  qup=quips
/+  diary-json
/+  migrate=diary-graph
^-  agent:gall
=>
  |%
  +$  card  card:agent:gall
  +$  version
    $%  state-0:d
    ==
  --
=|  state-0:d
=*  state  -
=< 
  %+  verb  &
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      cor   ~(. +> [bowl ~])
  ++  on-init  
    ^-  (quip card _this)
    =^  cards  state
      abet:init:cor
    [cards this]
  ::
  ++  on-save  !>(state)
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    =/  old  !<(version vase)
    ?-  -.old
      %0  `this(state old)
    ==
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
      abet:(poke:cor mark vase)
    [cards this]
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =^  cards  state
      abet:(watch:cor path)
    [cards this]
  ::
  ++  on-peek   peek:cor
  ::
  ++  on-leave   on-leave:def
  ++  on-fail    on-fail:def
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state
      abet:(agent:cor wire sign)
    [cards this]
  ++  on-arvo
    |=  [=wire sign=sign-arvo]
    ^-  (quip card _this)
    =^  cards  state
      abet:(arvo:cor wire sign)
    [cards this]
  --
|_  [=bowl:gall cards=(list card)]
++  abet  [(flop cards) state]
++  cor   .
++  emit  |=(=card cor(cards [card cards]))
++  emil  |=(caz=(list card) cor(cards (welp (flop caz) cards)))
++  give  |=(=gift:agent:gall (emit %give gift))
++  init
  ^+  cor
  watch-groups
::
++  watch-groups
  ^+  cor
  (emit %pass /groups %agent [our.bowl %groups] %watch /groups)
::
++  poke
  |=  [=mark =vase]
  |^  ^+  cor 
  ?+    mark  ~|(bad-poke/mark !!)
  ::
      %graph-imports  (import !<(imports:d vase))
  ::
      ?(%flag %channel-join)
    =+  !<(=flag:d vase)
    ?<  =(our.bowl p.flag)
    (join flag)
  ::
      %diary-leave
    =+  !<(=leave:d vase)
    ?<  =(our.bowl p.leave)  :: cannot leave chat we host
    di-abet:di-leave:(di-abed:di-core leave)
  ::
      %diary-create
    =+  !<(req=create:d vase)
    (create req)
  ::
      %diary-action
    =+  !<(=action:d vase)
    =.  p.q.action  now.bowl
    =/  diary-core  (di-abed:di-core p.action)
    ?:  =(p.p.action our.bowl)
      di-abet:(di-update:diary-core q.action)
    di-abet:(di-proxy:diary-core q.action)
  ::
      %diary-remark-action
    =+  !<(act=remark-action:d vase)
    di-abet:(di-remark-diff:(di-abed:di-core p.act) q.act)
  ==
  ++  join
    |=  =flag:d
    ^+  cor
    =.  shelf  (~(put by shelf) flag *diary:d)
    di-abet:(di-join:di-core flag)
  ::
  ++  create
    |=  req=create:d
    ^+  cor
    =/  =flag:d  [our.bowl name.req]
    =|  =diary:d
    =/  =perm:d  [writers.req group.req]
    =.  perm.diary  perm
    =.  net.diary  [%pub ~]
    =.  shelf  (~(put by shelf) flag diary)
    di-abet:(di-init:(di-abed:di-core flag) req)
  

  --
::
++  import
  |=  =imports:d
  ^+  cor
  %+  roll  ~(tap by imports)
  |=  $:  $:  =flag:d
              writers=(set ship) 
              =association:met:d
              =update-log:gra:d
              =graph:gra:d
          ==
          out=_cor
      ==
  |^
  =/  =perm:d
    :_  group.association
    ?:(=(~ writers) ~ (silt (rap 3 %diary '-' (scot %p p.flag) '-' q.flag ~) ~))
  =/  =diary:d
    :*  net=?:(=(our.bowl p.flag) pub/~ sub/p.flag)
        log=(import-log update-log)
        perm
        %grid  :: TODO: check defaults with design
        %time
        graph-to-notes
        *remark:d
        banter=*(map time quips:d)
    ==
  =.  shelf  (~(put by shelf) flag diary)
  di-abet:(di-import:(di-abed:di-core:out flag) writers association) ::
  ++  import-log  
    |=  log=update-log:gra:d
    ^-  log:d
    *log:d ::TODO fix
  ::
  ++  graph-to-notes
    %+  gas:on:notes:d  *notes:d
    %+  turn  (tap:orm-gra:d graph)
    |=  [=time =node:gra:d]
    ^-  [_time note:d]
    [time (node-to-note time node)]
  ++  orm  orm-gra:d
  ::  TODO: review crashing semantics
  ::        check graph ordering (backwards iirc)
  ++  node-to-note
    |=  [=time =node:gra:d]
    ^-  note:d
    =/  =seal:d  [time ~]
    ?>  ?=(%graph -.children.node)
    ?>  ?=(%& -.post.node)
    =/  pos=post:gra:d
      =/  post-outer  (need (get:orm p.children.node 1))
      ?>  ?=(%graph -.children.post-outer)
      =/  nod  val:(need (pry:orm p.children.post-outer))
      ?>  ?=(%& -.post.nod)
      p.post.nod
    =/  =com=node:gra:d
      (need (get:orm p.children.node 2))
    ::  =/  comments  (node-to-comments com-node)
    ?>  ?=([[%text *] *] contents.pos)
    =/  con=(list verse:d)  (migrate t.contents.pos)
    =/  =essay:d
      =,(pos [text.i.contents '' con author time-sent])
    [seal essay]
  ::
  ++  node-to-quips
    |=  =quips:d
    !!
  --

++  watch
  |=  =path
  ^+  cor
  ?+    path  ~|(bad-watch-path/path !!)
      [%briefs ~]  ?>(from-self cor)
      [%ui ~]      ?>(from-self cor)
    ::
      [%diary @ @ *]
    =/  =ship  (slav %p i.t.path)
    =*  name   i.t.t.path
    di-abet:(di-watch:(di-abed:di-core ship name) t.t.t.path)
  ==
::
++  agent
  |=  [=wire =sign:agent:gall]
  ^+  cor
  ?+    wire  ~|(bad-agent-wire/wire !!)
  ::
      [%hark ~]
    ?>  ?=(%poke-ack -.sign)
    ?~  p.sign  cor
    %-  (slog leaf/"Failed to hark" u.p.sign)
    cor
  ::
      [%diary @ @ *]
    =/  =ship  (slav %p i.t.wire)
    =*  name   i.t.t.wire
    di-abet:(di-agent:(di-abed:di-core ship name) t.t.t.wire sign)
  ::
      [%groups ~]
    ?+    -.sign  !!
      %kick  watch-groups
    ::
        %watch-ack
      %.  cor
      ?~  p.sign  same
      =/  =tank
        leaf/"Failed groups subscription in {<dap.bowl>}, unexpected"
      (slog tank u.p.sign)
    ::
        %fact
      ?.  =(%group-action p.cage.sign)  cor
      (take-groups !<(=action:g q.cage.sign))
    ==
  ==
++  take-groups
  |=  =action:g
  =/  affected=(list flag:d)
    %+  murn  ~(tap by shelf)
    |=  [=flag:d =diary:d]
    ?.  =(p.action group.perm.diary)  ~
    `flag
  ?+    q.q.action  cor
      [%fleet * %del ~]
    ~&  'revoke perms for'
    %+  roll  affected
    |=  [=flag:d co=_cor]
    ^+  cor
    %+  roll  ~(tap in p.q.q.action)
    |=  [=ship ci=_cor]
    ^+  cor
    =/  di  (di-abed:di-core:ci flag)
    di-abet:(di-revoke:di ship)
  ::
      [%fleet * %del-sects *]
    ~&  'recheck permissions'
    %+  roll  affected
    |=  [=flag:d co=_cor]
    =/  di  (di-abed:di-core:co flag)
    di-abet:di-recheck:di
  ::
      [%channel * %del-sects *]
    ~&  'recheck permissions'
    %+  roll  affected
    |=  [=flag:d co=_cor]
    =/  di  (di-abed:di-core:co flag)
    di-abet:di-recheck:di
  ==
::
++  arvo
  |=  [=wire sign=sign-arvo]
  ^+  cor
  ~&  arvo/wire
  cor
++  peek
  |=  =path
  ^-  (unit (unit cage))
  ?+  path  [~ ~]
  ::
    [%x %shelf ~]  ``shelf+!>(shelf)
  ::
      [%x %diary @ @ *]
    =/  =ship  (slav %p i.t.t.path)
    =*  name   i.t.t.t.path
    (di-peek:(di-abed:di-core ship name) t.t.t.t.path)
    ::
      [%x %briefs ~]
    =-  ``diary-briefs+!>(-)
    ^-  briefs:d
    %-  ~(gas by *briefs:d)
    %+  turn  ~(tap in ~(key by shelf))
    |=  =flag:d
    :-  flag
    di-brief:(di-abed:di-core flag)
  ==
::
++  give-brief
  |=  [=flag:d =brief:briefs:d]
  (give %fact ~[/briefs] diary-brief-update+!>([flag brief]))
::
++  pass-hark
  |=  [all=? desk=? =yarn:ha]
  ^-  card
  =/  =wire  /hark
  =/  =dock  [our.bowl %hark]
  =/  =cage  hark-action+!>([%add-yarn all desk yarn])
  [%pass wire %agent dock %poke cage]
++  spin
  |=  [=rope:ha con=(list content:ha) wer=path but=(unit button:ha)]
  ^-  yarn:ha
  =/  id  (end [7 1] (shax eny.bowl))
  [id rope now.bowl con wer but]
++  flatten
  |=  content=(list inline:d)
  ^-  cord
  %-  crip
  %-  zing
  %+  turn
    content
  |=  c=inline:d
  ^-  tape
  ?@  c  (trip c)
  ?-  -.c
      %break  ""
      %tag    (trip p.c)
      %link   (trip q.c)
      %block   (trip q.c)
      ?(%code %inline-code)  ""
      ?(%italics %bold %strike %blockquote)  (trip (flatten p.c))
  ==
++  from-self  =(our src):bowl
++  di-core
  |_  [=flag:d =diary:d gone=_|]
  +*  di-notes  ~(. not notes.diary)
  ++  di-core  .
  ::  TODO: archive??
  ++  di-abet  
    %_  cor
        shelf  
      ?:(gone (~(del by shelf) flag) (~(put by shelf) flag diary))
    ==
  ++  di-abed
    |=  f=flag:d
    di-core(flag f, diary (~(got by shelf) f))
  ++  di-area  `path`/diary/(scot %p p.flag)/[q.flag]
  ++  di-spin
    |=  [rest=path con=(list content:ha) but=(unit button:ha)]
    =*  group  group.perm.diary
    =/  =nest:g  [dap.bowl flag]
    =/  rope  [`group `nest q.byk.bowl (welp /(scot %p p.flag)/[q.flag] rest)]
    =/  link  
      (welp /groups/(scot %p p.group)/[q.group]/channels/diary/(scot %p p.flag)/[q.flag] rest)
    (spin rope con link but)
  ::  TODO: add metadata
  ::        maybe delay the watch?
  ++  di-import
    |=  [writers=(set ship) =association:met:d]
    ^+  di-core
    =?  di-core  ?=(%sub -.net.diary)
      di-sub
    =?  di-core  ?=(%pub -.net.diary)
      (import-channel:di-pass association)
    =?  di-core  &(?=(%pub -.net.diary) !=(writers ~))
      (writer-sect:di-pass writers association)
    di-core
  ::
  ++  di-watch
    |=  =path
    ^+  di-core
    ?+    path  !!
      [%updates *]    (di-pub t.path)
      [%ui ~]         ?>(from-self di-core)
      [%ui %notes ~]  ?>(from-self di-core)
    ::
    ==
  ++  di-pass
    |%
    ++  writer-sect
      |=  [ships=(set ship) =association:met:d]
      =/  =sect:g
        (rap 3 %diary '-' (scot %p p.flag) '-' q.flag ~)
      =/  title=@t
        (rap 3 'Writers: ' title.metadatum.association ~)
      =/  desc=@t
        (rap 3 'The writers role for the ' title.metadatum.association ' notebook' ~)
      %+  poke-group  %import-writers
      :+  group.association   now.bowl
      [%cabal sect %add title desc '' '']
    ::
    ++  poke-group
      |=  [=term =action:g]
      ^+  di-core
      =/  =dock      [p.p.action %groups]
      =/  =wire      (snoc di-area term)
      =.  cor
        (emit %pass wire %agent dock %poke group-action+!>(action))
      di-core
    ::
    ++  create-channel
      |=  [=term group=flag:g =channel:g]
      ^+  di-core
      %+  poke-group  term
      ^-  action:g
      :+  group  now.bowl
      [%channel [dap.bowl flag] %add channel]
    ::
    ++  import-channel
      |=  =association:met:d
      =/  meta=data:meta:g
        [title description '' '']:metadatum.association
      (create-channel %import group.association meta now.bowl zone=%default %| ~)
    ::
    ++  add-channel
      |=  req=create:d
      %+  create-channel  %create
      [group.req =,(req [[title description '' ''] now.bowl %default | readers])]
    ::
    --
  ++  di-init
    |=  req=create:d
    =/  =perm:d  [writers.req group.req]
    =.  cor
      (give-brief flag di-brief)
    =.  di-core  (di-update now.bowl %create perm)
    (add-channel:di-pass req)
  ::
  ++  di-agent
    |=  [=wire =sign:agent:gall]
    ^+  di-core
    ?+  wire  !!
        ~  :: noop wire, should only send pokes
      di-core
    ::
        [%updates ~]
      (di-take-update sign)
    ::
        [%create ~]
      ?>  ?=(%poke-ack -.sign)
      %.  di-core  :: TODO rollback creation if poke fails?
      ?~  p.sign  same
      (slog leaf/"poke failed" u.p.sign)
    ==
  ::
  ++  di-brief  (brief:di-notes our.bowl last-read.remark.diary)
  ::
  ++  di-peek
    |=  =(pole knot)
    ^-  (unit (unit cage))
    ?+  pole  [~ ~]
        [%notes rest=*]  (peek:di-notes rest.pole)
        [%perm ~]        ``diary-perm+!>(perm.diary)
        [%quips time=@ rest=*]  
      =/  =time  (slav %ud time.pole)
      (~(peek qup (~(gut by banter.diary) time *quips:d)) rest.pole)
    ==
  ::
  ++  di-revoke
    |=  her=ship
    %+  roll  ~(tap in di-subscriptions)
    |=  [[=ship =path] he=_di-core]
    ?.  =(ship her)  he
    he(cor (emit %give %kick ~[path] `ship))
  ::
  ++  di-recheck
    %+  roll  ~(tap in di-subscriptions)
    |=  [[=ship =path] di=_di-core]
    ?:  (di-can-read:di ship)  di
    di(cor (emit %give %kick ~[path] `ship))
  ::
  ++  di-take-update
    |=  =sign:agent:gall
    ^+  di-core
    ?+    -.sign  di-core
      %kick  di-sub
    ::
        %watch-ack
      =.  net.diary  [%sub src.bowl]
      ?~  p.sign  di-core
      %-  (slog leaf/"Failed subscription" u.p.sign)
      =.  gone  &
      di-core
    ::
        %fact
      =*  cage  cage.sign 
      ?+  p.cage  di-core
        %diary-logs    (di-apply-logs !<(log:d q.cage))
        %diary-update  (di-update !<(update:d q.cage))
      ==
    ==
  ++  di-proxy
    |=  =update:d
    ^+  di-core
    ?>  di-can-write
    =/  =dock  [p.flag dap.bowl]
    =/  =cage  diary-action+!>([flag update])
    =.  cor
      (emit %pass di-area %agent dock %poke cage)
    di-core
  ::
  ++  di-groups-scry
    =*  group  group.perm.diary
    /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/(scot %p p.group)/[q.group]
  ::
  ++  di-can-write
    ?:  =(p.flag src.bowl)  &
    =/  =path
      %+  welp  di-groups-scry
      /fleet/(scot %p src.bowl)/vessel/noun
    =+  .^(=vessel:fleet:g %gx path)
    ?:  =(~ writers.perm.diary)  &
    !=(~ (~(int in writers.perm.diary) sects.vessel))
  ::
  ++  di-can-read
    |=  her=ship
    =/  =path
      %+  welp  di-groups-scry
      /channel/[dap.bowl]/(scot %p p.flag)/[q.flag]/can-read/(scot %p her)/loob
    .^(? %gx path)
  ::
  ++  di-pub
    |=  =path
    ^+  di-core
    ?>  (di-can-read src.bowl)
    =/  =log:d
      ?~  path  log.diary
      =/  =time  (slav %da i.path)
      (lot:log-on:d log.diary `time ~)
    =/  =cage  diary-logs+!>(log)
    =.  cor  (give %fact ~ cage)
    di-core
  ::
  ++  di-sub
    ^+  di-core
    =/  tim=(unit time)
      (bind (ram:log-on:d log.diary) head)
    =/  base=wire  (snoc di-area %updates)
    =/  =path 
      %+  weld  base
      ?~  tim  ~
      /(scot %da u.tim)
    =/  =card
      [%pass base %agent [p.flag dap.bowl] %watch path]
    =.  cor  (emit card)
    di-core
  ::
  ++  di-join
    |=  f=flag:d
    ^+  di-core
    =.  shelf  (~(put by shelf) f *diary:d)
    =.  di-core  (di-abed f)
    =.  cor  (give-brief flag di-brief)
    di-sub
  ::
  ++  di-leave
    =/  =dock  [p.flag dap.bowl]
    =/  =wire  (snoc di-area %updates)
    =.  cor  (emit %pass wire %agent dock %leave ~)
    =.  cor  (emit %give %fact ~[/briefs] diary-leave+!>(flag))
    =.  gone  &
    di-core
  ::
  ++  di-apply-logs
    |=  =log:d
    ^+  di-core
    =/  updates=(list update:d)
      (tap:log-on:d log)
    %+  roll  updates
    |=  [=update:d di=_di-core]
    (di-update:di update)
  ::
  ++  di-subscriptions
    %+  roll  ~(val by sup.bowl)
    |=  [[=ship =path] out=(set [ship path])]
    ?.  =((scag 4 path) (snoc di-area %updates))
      out
    (~(put in out) [ship path])
  ::
  ++  di-give-updates
    |=  [=time d=diff:d]
    ^+  di-core
    =/  paths=(set path)
      %-  ~(gas in *(set path))
      (turn ~(tap in di-subscriptions) tail)
    =.  paths  (~(put in paths) (snoc di-area %ui))
    ~&  [flag [time d]]
    =.  cor  (give %fact ~[/ui] diary-action+!>([flag [time d]]))
    =/  cag=cage  diary-update+!>([time d])
    =.  cor
      (give %fact ~(tap in paths) cag)
    di-core
  ::
  ++  di-remark-diff
    |=  diff=remark-diff:d
    ^+  di-core
    =.  cor
      (give %fact ~[(snoc di-area %ui)] diary-remark-action+!>([flag diff]))
    =.  remark.diary
      ?-  -.diff
        %watch    remark.diary(watching &)
        %unwatch  remark.diary(watching |)
        %read-at  !!
      ::
          %read   remark.diary(last-read now.bowl)
      ==
    =.  cor
      (give-brief flag di-brief)
    di-core
  ::
  ++  di-update
    |=  [=time dif=diff:d]
    ?>  di-can-write
    ^+  di-core
    =.  log.diary
      (put:log-on:d log.diary time dif)
    =.  di-core
      (di-give-updates time dif)
    ?-    -.dif
        %notes
      di-core(notes.diary (reduce:di-notes time p.dif))
    ::
        %quips
      =/  =quips:d      (~(gut by banter.diary) p.dif *quips:d)
      =.  quips         (~(reduce qup quips) time q.dif)
      =.  banter.diary  (~(put by banter.diary) p.dif quips)
      ?-  -.q.q.dif
          ?(%del %add-feel %del-feel)  di-core
          %add
        =/  =memo:d  p.q.q.dif
        =/  [ti=^time =note:d]  (~(got not notes.diary) p.dif)        
        =/  in-replies
          %+  lien
            (tap:on:quips:d quips)
          |=  [=^time =quip:d]
          =(author.quip our.bowl)
        ?:  |(=(author.memo our.bowl) !in-replies)  di-core
        =/  yarn
          %^  di-spin
            /note/(rsh 4 (scot %ui replying.memo))
            :~  [%ship author.memo]
                ' commented on '
                [%emph title.note]
                ': '
                [%ship author.memo]
                ': '
                (flatten content.memo)
            ==
          ~  
        =.  cor  (emit (pass-hark & & yarn))
        di-core
      ==
    ::
        %add-sects
      =*  p  perm.diary
      =.  writers.p  (~(uni in writers.p) p.dif)
      di-core
    ::
        %del-sects
      =*  p  perm.diary
      =.  writers.p  (~(dif in writers.p) p.dif)
      di-core
    ::
        %create
      =.  perm.diary  p.dif
      di-core
    ::
        %sort
      =.  sort.diary  p.dif
      di-core
    ::
        %view
      =.  view.diary  p.dif
      di-core
    ==
  --
--

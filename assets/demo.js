/* 把代码安个家 · 五枚小样 —— 零依赖 vanilla JS */
(function () {
  "use strict";
  var $ = function (s, p) { return (p || document).querySelector(s); };
  var termLine = function (el, html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ============ 小样 1 · 握手室 ============ */
  (function d1() {
    var mHttps = $("#d1-m-https"), mSsh = $("#d1-m-ssh");
    var pHttps = $("#d1-https"), pSsh = $("#d1-ssh");
    mHttps.addEventListener("click", function () {
      mHttps.classList.add("on"); mSsh.classList.remove("on");
      pHttps.style.display = ""; pSsh.style.display = "none";
    });
    mSsh.addEventListener("click", function () {
      mSsh.classList.add("on"); mHttps.classList.remove("on");
      pSsh.style.display = ""; pHttps.style.display = "none";
    });

    /* HTTPS 侧 */
    var cred = false, dlg = $("#d1-hs-dialog"), credEl = $("#d1-hs-cred");
    var boatD = $("#d1-hs-boat-d"), pkt = $("#d1-hs-pkt");
    var fly = function () {
      pkt.classList.remove("go"); void pkt.offsetWidth; pkt.classList.add("go");
    };
    $("#d1-hs-push").addEventListener("click", async function () {
      if (cred) {
        fly();
        boatD.textContent = "凭据管理器自动出示令牌 → 200 OK，已推上远程";
        boatD.style.color = "var(--ok)";
        return;
      }
      dlg.classList.add("show");
      boatD.textContent = "第一次 push：弹出窗口索要证件……";
      boatD.style.color = "";
      fly();
    });
    $("#d1-hs-save").addEventListener("click", function () {
      cred = true;
      dlg.classList.remove("show");
      credEl.style.visibility = "visible";
      boatD.textContent = "令牌已收进系统保险箱，下次 push 自动出示";
    });
    $("#d1-hs-expire").addEventListener("click", function () {
      cred = false;
      credEl.style.visibility = "hidden";
      dlg.classList.remove("show");
      boatD.textContent = "401 · 令牌过期/被吊销 —— 重新生成一枚，或换 SSH";
      boatD.style.color = "var(--red)";
    });

    /* SSH 侧 */
    var keysMade = false, testing = false;
    var term = $("#d1-ssh-term");
    var setLine = function (html) { term.innerHTML = "<div>" + html + "</div>"; };
    $("#d1-ssh-443").addEventListener("change", function () {
      setLine(this.checked
        ? '<span class="c"># 已切换备用航道：实际连接 ssh.github.com:443</span>'
        : '<span class="c"># 已切回默认 22 端口</span>');
    });
    $("#d1-ssh-test").addEventListener("click", async function () {
      if (testing) return;
      testing = true;
      var via443 = $("#d1-ssh-443").checked;
      if (!keysMade) {
        setLine('<span class="p">$</span> ssh-keygen -t ed25519 -C "you@example.com"');
        await wait(500);
        termLine(term, '<span class="c">生成中…… oooOOoo 熵来了</span>');
        await wait(600);
        $("#d1-k1").classList.add("lit");
        await wait(250);
        $("#d1-k2").classList.add("lit");
        $("#d1-k2").classList.add("fly");
        await wait(700);
        $("#d1-k2").classList.remove("fly");
        termLine(term, '<span class="ok">✔ 钥匙对就位：私钥留在 ~/.ssh，公钥已贴上平台</span>');
        keysMade = true;
        await wait(400);
      }
      setLine('<span class="p">$</span> ssh -T git@github.com' + (via443 ? '  <span class="c"># 经 ssh.github.com:443</span>' : ""));
      await wait(450);
      termLine(term, '<span class="c">← 港方发来挑战：一串随机数</span>');
      await wait(650);
      termLine(term, '<span class="in">→ 本机用<b>私钥</b>签名应答（暗号本身从不出门）</span>');
      await wait(650);
      termLine(term, '<span class="c">← 港方用<b>公钥</b>验证签名：对上了</span>');
      await wait(500);
      termLine(term, '<span class="ok">✔ Hi StarrySea1412! You\'ve successfully authenticated</span>');
      testing = false;
    });
  })();

  /* ============ 小样 2 · 三区搬运线 ============ */
  (function d2() {
    var FILES = [
      { n: "main.py", ic: "🐍" }, { n: "app.js", ic: "🧩" },
      { n: "style.css", ic: "🎨" }, { n: "README.md", ic: "📖" },
      { n: "secret.key", ic: "🗝️" }
    ];
    var state, term = $("#d2-term"), commits = 0;
    function reset() {
      state = FILES.map(function (f) { return { zone: "wt", sel: false, committed: false }; });
      commits = 0;
      $("#d2-ignore").checked = false;
      $("#d2-lc-dots").innerHTML = ""; $("#d2-rc-dots").innerHTML = "";
      $("#d2-lc-ab").textContent = ""; $("#d2-rc-ab").textContent = "·";
      $("#d2-msg").value = "";
      term.innerHTML = '<span class="c"># 货物已备好：点文件芯片选中/取消，然后按流水线走一遍</span>';
      render();
    }
    function isIgnored(i) {
      return FILES[i].n === "secret.key" && $("#d2-ignore").checked && !state[i].committed;
    }
    function chipEl(i) {
      var f = FILES[i], st = state[i];
      var el = document.createElement("div");
      el.className = "d2-chip" + (st.sel ? " sel" : "") + (isIgnored(i) ? " ignored" : "");
      el.innerHTML = '<span class="ico">' + f.ic + '</span>' + f.n;
      if (!isIgnored(i) && st.zone === "wt") {
        el.addEventListener("click", function () { st.sel = !st.sel; render(); });
      } else if (isIgnored(i)) {
        el.title = "已被 .gitignore 忽略，add 不动它";
      }
      return el;
    }
    function render() {
      var wt = $("#d2-wt-files"), ix = $("#d2-ix-files");
      wt.innerHTML = ""; ix.innerHTML = "";
      FILES.forEach(function (f, i) {
        if (state[i].zone === "wt") wt.appendChild(chipEl(i));
        else if (state[i].zone === "ix") ix.appendChild(chipEl(i));
      });
      var pushed = $("#d2-rc-dots").children.length;
      var ahead = commits - pushed;
      $("#d2-lc-ab").textContent = ahead > 0 ? "领先远程 " + ahead + " 个提交" : "与远程一致";
      $("#d2-rc-ab").textContent = pushed ? "已收 " + pushed + " 个提交" : "·";
    }
    function dot(el, hot) {
      var i = document.createElement("i");
      if (hot) i.className = "hot";
      el.appendChild(i);
      return i;
    }
    var log = function (html) { termLine(term, html); };
    $("#d2-add").addEventListener("click", function () {
      var picked = state.filter(function (s, i) { return s.zone === "wt" && s.sel && !isIgnored(i); });
      if (!picked.length) {
        log('<span class="p">$</span> git add .   <span class="err">没有选中的货物 ——（点文件芯片试试）</span>');
        return;
      }
      var names = [];
      state.forEach(function (s2, i2) { if (s2.zone === "wt" && s2.sel && !isIgnored(i2)) names.push(FILES[i2].n); });
      log('<span class="p">$</span> git add ' + names.join(" "));
      picked.forEach(function (s) { s.zone = "ix"; s.sel = false; });
      render();
    });
    $("#d2-commit").addEventListener("click", function () {
      var staged = state.filter(function (s) { return s.zone === "ix"; });
      if (!staged.length) {
        log('<span class="p">$</span> git commit   <span class="err">nothing to commit —— 暂存区是空的</span>');
        return;
      }
      var msg = $("#d2-msg").value.trim();
      if (!msg) {
        log('<span class="p">$</span> git commit -m "…"   <span class="err">先写一句人话：这次提交干了什么？</span>');
        return;
      }
      log('<span class="p">$</span> git commit -m "' + msg + '"');
      log('<span class="ok">  [main ' + Math.random().toString(16).slice(2, 9) + '] ' + msg + '</span>');
      staged.forEach(function (s) { s.zone = "done"; s.committed = true; });
      commits++;
      dot($("#d2-lc-dots"), true);
      render();
    });
    $("#d2-push").addEventListener("click", async function () {
      var ahead = commits;
      var pushed = $("#d2-rc-dots").children.length;
      if (ahead <= pushed) {
        log('<span class="p">$</span> git push   <span class="err">Everything up-to-date —— 远程已经跟上，先 commit 再来</span>');
        return;
      }
      log('<span class="p">$</span> git push');
      log('<span class="c">  枚举对象: 100% ... 写入对象: 100% ...</span>');
      await wait(500);
      var rc = $("#d2-rc-dots");
      var lc = $("#d2-lc-dots");
      while (rc.children.length < ahead) {
        var moved = lc.children[rc.children.length];
        if (moved) moved.classList.remove("hot");
        dot(rc, false);
        render();
        await wait(220);
      }
      log('<span class="ok">  To github.com:you/repo.git —— 船已靠泊 ✔</span>');
    });
    $("#d2-reset").addEventListener("click", reset);
    reset();
  })();

  /* ============ 小样 3 · 双港调度台 ============ */
  (function d3() {
    var AHEAD = 3, term = $("#d3-term"), cfg = $("#d3-cfg"), boat = $("#d3-boat");
    var gh = { el: $("#d3-gh"), dots: $("#d3-gh-dots"), st: $("#d3-gh-st"), n: 0, ok: false };
    var ge = { el: $("#d3-ge"), dots: $("#d3-ge-dots"), st: $("#d3-ge-st"), n: 0, ok: false };
    var dualPush = false, busy = false;
    function paint() {
      [gh, ge].forEach(function (p) {
        p.dots.innerHTML = "";
        for (var i = 0; i < p.n; i++) { var d = document.createElement("i"); p.dots.appendChild(d); }
      });
      var ahead = AHEAD - Math.max(gh.n, ge.n);
      boat.querySelector(".nm").textContent = "本机 · " + (ahead > 0 ? "领先 " + ahead : "全部推完");
      boat.classList.toggle("sail", ahead > 0);
      [gh, ge].forEach(function (p) {
        p.el.classList.remove("st-ok", "st-bad", "st-wait");
        if (p.n >= AHEAD) { p.el.classList.add("st-ok"); p.st.textContent = "✔ 已同步"; p.st.style.color = "var(--ok)"; }
        else if (p.st.dataset.bad) { p.el.classList.add("st-bad"); p.st.textContent = "✕ 连接超时"; p.st.style.color = "var(--red)"; }
        else if (p.n > 0) { p.el.classList.add("st-wait"); p.st.textContent = "落后 " + (AHEAD - p.n); p.st.style.color = "var(--gold)"; }
        else { p.st.textContent = "·"; p.st.style.color = "var(--muted)"; }
      });
    }
    function log(html) { termLine(term, html); }
    function dualCfg() {
      if (!dualPush) {
        dualPush = true;
        cfg.innerHTML = '[remote "origin"]\n    url = git@github.com:you/repo.git\n    <b style="color:#e9c98a">pushurl = git@github.com:you/repo.git</b>\n    <b style="color:#e9c98a">pushurl = git@gitee.com:you/repo.git</b>';
        log('<span class="c"># set-url --add 已写入两条 pushurl —— 一次 push，两港靠泊</span>');
      }
    }
    function pushTo(p, label) {
      return new Promise(function (resolve) {
        if (p.n >= AHEAD) { log('<span class="err">  ' + label + ': Everything up-to-date</span>'); return resolve(); }
        var fog = $("#d3-fog").checked && label === "GitHub";
        p.st.dataset.bad = "";
        p.el.classList.add("st-wait"); p.st.textContent = "连接中……"; p.st.style.color = "var(--gold)";
        log('<span class="p">$</span> git push ' + label + (fog ? '   <span class="c"># ☁️ 雾区航线</span>' : ""));
        wait(fog ? 1700 : 800).then(function () {
          if (fog) {
            p.st.dataset.bad = "1";
            log('<span class="err">  fatal: unable to access: Failed to connect port 443: Timed out</span>');
            log('<span class="c">  —— 幸好另一个港还在。稍后雾散再补推。</span>');
            paint(); resolve();
          } else {
            p.n = AHEAD; paint();
            log('<span class="ok">  ' + label + ' ✔ 对象 100% 写入，船已靠泊</span>');
            resolve();
          }
        });
      });
    }
    $("#d3-push-gh").addEventListener("click", async function () { if (busy) return; busy = true; await pushTo(gh, "GitHub"); busy = false; });
    $("#d3-push-ge").addEventListener("click", async function () { if (busy) return; busy = true; await pushTo(ge, "Gitee"); busy = false; });
    $("#d3-push-all").addEventListener("click", async function () {
      if (busy) return; busy = true; dualCfg();
      await pushTo(gh, "GitHub"); await pushTo(ge, "Gitee");
      log('<span class="c"># —— 这就是双推：一行命令，两份保险</span>');
      busy = false;
    });
    $("#d3-fetch").addEventListener("click", function () {
      log('<span class="p">$</span> git fetch origin &amp;&amp; git fetch gitee');
      wait(700).then(function () {
        var a = AHEAD - gh.n, b = AHEAD - ge.n;
        log('<span class="c">  对账：GitHub 落后 ' + a + ' · Gitee 落后 ' + b + (a + b ? ' —— 拉不回新东西（新提交只在本地），但看清了两边的进度' : ' —— 三方一致') + '</span>');
      });
    });
    $("#d3-fog").addEventListener("change", function () {
      $("#d3-sea").classList.toggle("fog", this.checked);
      if (this.checked) log('<span class="c"># ☁️ GitHub 航线进入雾区 —— 推送将超时。Gitee 不受影响。</span>');
    });
    $("#d3-reset").addEventListener("click", function () {
      gh.n = ge.n = 0; gh.st.dataset.bad = ""; ge.st.dataset.bad = ""; dualPush = false;
      cfg.textContent = '[remote "origin"]\n    url = git@github.com:you/repo.git';
      term.innerHTML = '<span class="c"># 在本机攒三个提交，然后分别试试单推和双推；雾中推 GitHub 会超时</span>';
      paint();
    });
    paint();
  })();

  /* ============ 小样 4 · 灯塔决策树 ============ */
  (function d4() {
    var SYMS = [
      { ic: "⏳", t: "push 卡住 20 秒后超时", steps: [
        { q: "第 1 步 · 隔离变量", a: "先分清是「墙」还是本机问题：", cmd: "curl -I --max-time 8 https://github.com\ncurl -I --max-time 8 https://gitee.com   # 通 → 本机无罪" },
        { q: "第 2 步 · 查代理配置", a: "两种病症状一样、病因相反：代理没挂上，或代理软件关了配置还挂着。", cmd: "git config --global --get http.proxy" },
        { q: "第 3 步 · 换航道", a: "22 端口被封时，SSH 走 443 备用航道；HTTPS 请求挂上代理重试。", cmd: '# ~/.ssh/config\nHost github.com\n  HostName ssh.github.com\n  Port 443\n  User git' }],
        fin: "处方：挂/摘代理 → SSH 走 443 → 都不通就上 Git Data API 兜底（见本港走查三）。" },
      { ic: "🔒", t: "Authentication failed / 403", steps: [
        { q: "第 1 步 · 读报错", a: "GitHub 的密码通道 2021 年 8 月就关了——命令行要的是 Personal Access Token，不是账号密码。", cmd: "remote: Support for password authentication was removed.\nremote: Please use a personal access token instead." },
        { q: "第 2 步 · 查令牌三件事", a: "fine-grained 令牌要核对：① 是否勾选了「这个」仓库 ② Contents 权限给了读写没有 ③ 过期了没有。", cmd: "Settings → Developer settings → Fine-grained tokens" },
        { q: "第 3 步 · Gitee 直接换 SSH", a: "Gitee 私有仓在 HTTPS 通道上经常白耗时间，SSH 一次通过（见走查一）。", cmd: "git remote set-url origin git@gitee.com:you/repo.git" }],
        fin: "处方：GitHub 用 fine-grained 令牌 + 凭据管理器；Gitee 直接 SSH。令牌按仓库授权、设过期日。"},
      { ic: "✂️", t: "clone 到一半断线", steps: [
        { q: "第 1 步 · 减负重试", a: "大仓库先浅克隆，只要最新一层，体积小一个量级：", cmd: "git clone --depth 1 https://github.com/you/big-repo.git" },
        { q: "第 2 步 · 大文件单独走镜像", a: "release 附件和 raw 文件加镜像前缀，比整仓拉取稳得多：", cmd: "https://ghfast.top/https://github.com/you/repo/releases/download/v1/x.zip" },
        { q: "第 3 步 · 换个出发点", a: "用 Gitee「导入仓库」把它搬一份，然后从 Gitee clone——国内全速。", cmd: "gitee.com → 新建仓库 → 导入已有仓库" }],
        fin: "处方：--depth 1 → 附件走镜像 → 导入 Gitee 再 clone。镜像会漂，别写死进脚本。"},
      { ic: "🏚️", t: "Pages 打开 404", steps: [
        { q: "第 1 步 · 先看灯塔", a: "官方故障时，你怎么折腾仓库都没用。十秒钟排除：", cmd: "www.githubstatus.com" },
        { q: "第 2 步 · push 真的走完了吗", a: "传输中就开 Pages = 构建拿到半成品，必 404（见走查四）。", cmd: "git status   # 并回看 push 的对象计数是否 100%" },
        { q: "第 3 步 · 构建绿了吗", a: "仓库 Actions 页看 Pages build 日志；再核对分支/目录设置与文件名大小写。", cmd: "Settings → Pages → Build and deployment" }],
        fin: "处方：githubstatus → push 完成 → 构建变绿 → 强刷 Ctrl+F5。四步走完再怀疑人生。"}
    ];
    var pick = $("#d4-pick"), flow = $("#d4-flow");
    SYMS.forEach(function (s, idx) {
      var b = document.createElement("button");
      b.className = "d4-sym";
      b.innerHTML = '<div class="ic">' + s.ic + '</div><div class="t">' + s.t + '</div>';
      b.addEventListener("click", function () {
        [].forEach.call(pick.children, function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        flow.classList.add("show");
        flow.innerHTML = "";
        s.steps.forEach(function (st, k) {
          var d = document.createElement("div");
          d.className = "d4-step"; d.style.animationDelay = (k * 0.08) + "s";
          d.innerHTML = '<div class="q">' + st.q + '</div><div class="a">' + st.a + '</div>' +
            (st.cmd ? '<code class="cmd">' + st.cmd.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</code>' : "");
          flow.appendChild(d);
        });
        var f = document.createElement("div");
        f.className = "d4-final";
        f.innerHTML = '<div class="t">🩹 ' + s.fin + '</div>';
        flow.appendChild(f);
        flow.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      pick.appendChild(b);
    });
  })();

  /* ============ 小样 5 · 发布线 ============ */
  (function d5() {
    var S = {};
    var st = { s1: $("#d5-s1"), s2: $("#d5-s2"), s3: $("#d5-s3"), s4: $("#d5-s4") };
    var led = function (el, cls) {
      el.classList.remove("led-ok", "led-bad", "led-wait");
      if (cls) el.classList.add(cls);
    };
    var bar = $("#d5-page-bar"), view = $("#d5-page-view"), page = $("#d5-page"), url = $("#d5-url");
    function paint() {
      url.innerHTML = 'https://starrysea1412.github.io/git-primer/ <span class="u">' +
        (S.err404 ? "# 404 · 半成品" : S.live ? "# ✓ 已上线" : S.building ? "# 构建中……" : "# 尚未发布") + '</span>';
      if (S.live) {
        page.classList.remove("err");
        bar.textContent = "200 OK · index.html";
        view.innerHTML = '<div style="text-align:center"><div style="font-size:24px">🏠</div><div style="margin-top:4px">把代码安个家 · 上线了</div></div>';
      } else if (S.err404) {
        page.classList.add("err");
        bar.textContent = "404 Not Found · 构建拿到的是半成品";
        view.textContent = "404 — 这页不在";
      } else {
        bar.textContent = "— 还没发布";
        view.textContent = "· · ·";
      }
    }
    function build(ok) {
      return new Promise(function (res) {
        led(st.s3, "led-wait");
        wait(1300).then(function () {
          led(st.s3, "led-ok");
          led(st.s4, ok ? "led-ok" : "led-bad");
          res();
        });
      });
    }
    $("#d5-push").addEventListener("click", async function () {
      if (S.pushing) return;
      S.pushing = true; led(st.s2, "led-wait");
      await wait(1800);
      led(st.s2, "led-ok");
      S.pushed = true; S.pushing = false;
      if (S.enabled) { await build(true); S.live = true; S.err404 = false; paint(); }
    });
    $("#d5-enable").addEventListener("click", async function () {
      if (S.enabled) return;
      S.enabled = true;
      if (S.pushed && !S.pushing) { await build(true); S.live = true; }
      else {
        await build(false);
        S.err404 = true;
      }
      paint();
    });
    $("#d5-visit").addEventListener("click", async function () {
      if (S.err404) {
        bar.textContent = "重试中 → 等待传输彻底结束 → 重新构建……";
        await wait(900);
        await build(true);
        S.err404 = false; S.live = true; paint();
        return;
      }
      if (!S.live && !S.building) {
        bar.textContent = "连接被拒绝 —— 站点还没发布。先 push，再开 Pages。";
      }
    });
    $("#d5-reset").addEventListener("click", function () {
      S = {};
      [st.s1, st.s2, st.s3, st.s4].forEach(function (el) { led(el, null); });
      paint();
    });
    paint();
  })();
})();

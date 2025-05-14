// 手风琴菜单栏+密码保护
function saveContent() {
  const content = document.documentElement.outerHTML;
  const blob = new Blob([content], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "index.html";
  a.click();
}

const headers = ["H1", "H2", "H3", "H4", "H5", "H6"];
const apiUrl = "https://api.692.cloudns.be/api/check-password";
const passwordTimeout = 5 * 60 * 1000; // 5分钟有效

// 检查本地是否已验证密码
function isPasswordValid() {
  const timestamp = localStorage.getItem("pw_verified_at");
  return timestamp && (Date.now() - Number(timestamp) < passwordTimeout);
}

// 保存密码验证成功时间
function setPasswordValid() {
  localStorage.setItem("pw_verified_at", Date.now());
}

// 展开/折叠菜单
function toggleMenu(target) {
  const subItem = target.nextElementSibling;
  let depth = 0, parent = subItem.parentElement;
  while (parent && parent !== document.querySelector(".accordion")) {
    depth++; parent = parent.parentElement;
  }

  document.querySelectorAll(".accordion p, .accordion div").forEach(el => {
    let elDepth = 0, elParent = el.parentElement;
    while (elParent && elParent !== document.querySelector(".accordion")) {
      elDepth++; elParent = elParent.parentElement;
    }
    if (elDepth >= depth && el !== subItem) el.style.display = "none";
  });

  subItem.style.display = (subItem.style.display === "block") ? "none" : "block";
  target.style.borderBottomRightRadius = target.style.borderBottomLeftRadius = "0";
}

document.querySelector(".accordion").addEventListener("click", async function(e) {
  const target = e.target;
  const name = target.nodeName.toUpperCase();

  if (!headers.includes(name)) return;

  const requiresPassword = target.getAttribute("data-password") === "true";

  if (requiresPassword && !isPasswordValid()) {
    const password = prompt("请输入密码：");
    if (password === null) return; // 用户点击取消

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (data.success) {
        setPasswordValid();
        toggleMenu(target);
      } else {
        alert("密码错误！");
        window.close();
      }
    } catch (err) {
      alert("请求失败，请稍后重试！");
    }
  } else {
    toggleMenu(target);
  }
});


// 加速title显示
(function() {
  const tip = Object.assign(document.createElement('div'), {
      id: 'tip-div',
      style: `display:none;color:#000;background:#f3f3f3;border:1px solid #ccc;
              font:12px/16px sans-serif;padding:5px;position:absolute;
              z-index:2000;pointer-events:none;max-width:300px;`
  });
  document.body.appendChild(tip);

  document.onmousemove = e => {
      const t = e.target;
      const title = t.title || t.getAttribute('_title');

      if (!title) return tip.style.display = 'none';

      if (t.title) {
          t.setAttribute('_title', t.title);
          t.removeAttribute('title');
      }

      if (tip.textContent !== title) tip.textContent = title;

      tip.style.display = 'block';
      const x = Math.min(e.pageX + 10, innerWidth - tip.offsetWidth - 5);
      const y = Math.min(e.pageY + 10, innerHeight - tip.offsetHeight - 5);
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
  };
})();
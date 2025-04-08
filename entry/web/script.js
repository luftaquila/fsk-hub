let notyf = new Notyf({
  ripple: false,
  duration: 3500,
  types: [{
    type: 'warn',
    background: 'orange',
    icon: {
      className: 'fa fa-exclamation-triangle',
      tagName: 'i',
      color: 'white',
    }
  }]
});

let table = new simpleDatatables.DataTable("#entry-table", {
  columns: [
    { select: 0, sort: "asc" },
    { select: 1 },
    { select: 2 },
    {
      select: 3, sortable: false, type: "string", render: (value, td, row, cell) => {
        let entry = Number(table.data.data[row].cells[0].text);
        return `<span class="remove btn red small" onclick="remove(${entry})"><i class="fa fw fa-delete-left"></i></span>`;
      }
    },
  ],
  data: {
    headings: [
      { text: "엔트리", data: "num" },
      { text: "학교", data: "univ" },
      { text: "팀", data: "team" },
      { text: "삭제", data: "del" }
    ],
  },
  perPage: 100,
  perPageSelect: [10, 20, 50, 100],
});

simpleDatatables.makeEditable(table, { contextMenu: false });

table.on("editable.save.cell", async (newValue, oldValue, row, column) => {
  if (newValue === oldValue) {
    return;
  }

  edit({
    num: table.data.data[row].cells[0].text,
    univ: table.data.data[row].cells[1].text,
    team: table.data.data[row].cells[2].text,
    num_changed: column === 0,
    prev: oldValue,
  });
});

/* prevent editor doubleclick event for the delete entry buttons **************/
document.getElementById("entry-table").addEventListener("dblclick", e => {
  if (e.target.classList.contains('remove') || e.target.querySelector(".remove")) {
    e.stopImmediatePropagation();
  }
});

update();

/* functions ******************************************************************/
async function update() {
  try {
    const res = await fetch('/entry/all');

    if (!res.ok) {
      throw new Error(`엔트리 목록을 가져오지 못했습니다. (${res.status})`);
    }

    let result = Object.entries(await res.json()).map(([key, value]) => ({
      num: Number(key), ...value
    }));

    table.data.data = [];
    table.update();
    table.insert(result.map(x => { x.del = ""; return x }));
  } catch (e) {
    notyf.error(e.message);
  }
}

async function add() {
  let num = document.getElementById("new-num").value;
  let univ = document.getElementById("new-univ").value;
  let team = document.getElementById("new-team").value;

  try {
    const res = await fetch('/entry/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num, univ, team })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    document.getElementById("new-num").value = '';
    document.getElementById("new-univ").value = '';
    document.getElementById("new-team").value = '';

    notyf.success(`${num}번 엔트리를 추가했습니다.`);
  } catch (e) {
    notyf.error(e.message);
  }

  update();
}

async function edit(entry) {
  try {
    const res = await fetch(`/entry/team`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    notyf.success(`${entry.num}번 엔트리를 수정했습니다.`);
  } catch (e) {
    notyf.error(e.message);
  }

  update();
}

async function remove(num) {
  try {
    const res = await fetch(`/entry/team`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    notyf.success(`${num}번 엔트리를 삭제했습니다.`);
  } catch (e) {
    notyf.error(e.message);
  }

  update();
}

async function upload() {
  const file = document.getElementById('file').files[0];

  if (!file) {
    return notyf.error('파일을 선택하세요.');
  }

  try {
    const res = await fetch('/entry/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: await file.text() })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    notyf.success('파일 업로드 완료');
    update();
  } catch (e) {
    notyf.error(e.message);
  }
}

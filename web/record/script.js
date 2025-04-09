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

let table = {
  record: undefined,
  log: undefined,
};

setup();

async function setup() {
  update();

  table.record = new simpleDatatables.DataTable("#record-table", {
    columns: [
      { select: 0, sort: "asc" },
      { select: 1 },
      { select: 2 },
    ],
    data: {
      headings: [
        { text: "타임스탬프", data: "date" },
        { text: "엔트리", data: "num" },
        { text: "학교", data: "univ" },
        { text: "팀", data: "team" },
        { text: "레인", data: "lane" },
        { text: "경기", data: "type" },
        { text: "기록", data: "result" },
        { text: "비고", data: "detail" },
      ],
    },
    perPage: 100,
    perPageSelect: [10, 20, 50, 100],
  });

  table.log = new simpleDatatables.DataTable("#log-table", {
    columns: [
      { select: 0, sort: "asc", type: "date", format: "YYYY-MM-DD HH:mm:ss" },
      { select: 1 },
    ],
    data: {
      headings: [
        { text: "타임스탬프", data: "timestamp" },
        { text: "데이터", data: "data" }
      ],
    },
    perPage: 100,
    perPageSelect: [10, 20, 50, 100],
  });

  document.getElementById('file').addEventListener("change", async event => {
    table.record.data.data = [];
    table.record.update(true);

    table.log.data.data = [];
    table.log.update(true);

    document.getElementById('file-record-box').style.display = "block";
    document.getElementById('file-log-box').style.display = "none";

    if (event.target.value === "파일 선택") {
      return;
    }

    try {
      let data = await get(`/traffic/record?name=${event.target.value}`);

      if (event.target.value === "controller") {
        document.getElementById('file-record-box').style.display = "none";
        document.getElementById('file-log-box').style.display = "block";
        table.log.data.data = [];
        table.log.insert(data.map(x => { return { timestamp: date_to_string(new Date(x.timestamp)), data: x.data } }));
      } else {
        document.getElementById('file-record-box').style.display = "block";
        document.getElementById('file-log-box').style.display = "none";
        table.record.data.data = [];
        table.record.insert(data.map(x => {
          let name;

          switch (x.type) {
            case "accel":
              name = "가속 측정";
              break;

            case "gymkhana":
              name = "짐카나";
              break;

            case "skidpad":
              name = "스키드패드";
              break;

            default:
              name = "알 수 없음";
              break;
          }

          return {
            date: date_to_string(new Date(x.time)),
            num: x.num,
            univ: x.univ,
            team: x.team,
            lane: x.lane,
            type: name,
            result: `${x.result} ms`,
            detail: x.detail,
          };
        }));
      }
    } catch (e) {
      notyf.error(`파일을 읽어오지 못했습니다.<br>${e}`);
    }
  });

  document.getElementById('refresh').addEventListener("click", update);
}

async function update() {
  let prev = document.getElementById('file').value;

  try {
    let files = await get('/traffic/record/list');
    let html = "<option selected disabled>파일 선택</option>";

    for (let file of files) {
      html += `<option value='${file}' ${prev === file ? 'selected' : ''}>${file}</option>`;
    }

    let select = document.getElementById('file');
    select.innerHTML = html;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  } catch (e) {
    notyf.error(`기록 목록을 가져오지 못했습니다.<br>${e}`);
  }
}


/*******************************************************************************
 * utility functions                                                           *
 ******************************************************************************/
async function get(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const type = res.headers.get('content-type');

  if (type && type.includes('application/json')) {
    return await res.json();
  } else {
    return await res.text();
  }
}

function date_to_string(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, 0)}-${String(date.getDate()).padStart(2, 0)} ${String(date.getHours()).padStart(2, 0)}:${String(date.getMinutes()).padStart(2, 0)}:${String(date.getSeconds()).padStart(2, 0)}`;
}

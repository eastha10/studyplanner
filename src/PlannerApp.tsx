import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Folder,
  Home as HomeIcon,
  Plus,
  RotateCcw,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { PlannerRoutes } from "./router";
type Task = {
  id: number;
  planId: number;
  subject: string;
  title: string;
  done: boolean;
  minutes: number;
  date: string;
};
type Plan = {
  id: number;
  name: string;
  period: string;
  dDay: string;
  color: string;
  progress: number;
  targetDate?: string;
};
type TrashItem = { plan: Plan; tasks: Task[]; deletedAt: string };
const NAV = [
    ["/", "홈", HomeIcon],
    ["/planners", "폴더", Folder],
    ["/stats", "통계", BarChart3],
    ["/trash", "휴지통", Trash2],
  ] as const,
  C: { [k: string]: string } = {
    수학: "#008cff",
    영어: "#7c5cff",
    국어: "#ff8a4c",
    과학: "#18b981",
    탐구: "#f04485",
  };
const initialPlans: Plan[] = [
  {
    id: 1,
    name: "2학기 기말고사",
    period: "2026.07.01 - 07.28",
    dDay: "D-16",
    color: "#008cff",
    progress: 68,
  },
  {
    id: 2,
    name: "2027 대학수학능력시험",
    period: "2026.03.02 - 11.19",
    dDay: "D-130",
    color: "#7c5cff",
    progress: 42,
  },
  {
    id: 3,
    name: "수학 수행평가",
    period: "2026.07.08 - 07.18",
    dDay: "D-6",
    color: "#ff8a4c",
    progress: 85,
  },
];
const initialTasks: Task[] = [
  {
    id: 1,
    planId: 1,
    subject: "수학",
    title: "미적분 문제집 42~48p",
    done: true,
    minutes: 70,
    date: "2026-07-12",
  },
  {
    id: 2,
    planId: 1,
    subject: "영어",
    title: "교과서 3과 본문 암기",
    done: false,
    minutes: 45,
    date: "2026-07-12",
  },
  {
    id: 3,
    planId: 2,
    subject: "국어",
    title: "문학 기출 2회 분석",
    done: false,
    minutes: 60,
    date: "2026-07-12",
  },
  {
    id: 4,
    planId: 2,
    subject: "탐구",
    title: "생명과학 유전 오답 정리",
    done: false,
    minutes: 50,
    date: "2026-07-12",
  },
  {
    id: 5,
    planId: 3,
    subject: "수학",
    title: "발표 문제 풀이 정리",
    done: false,
    minutes: 40,
    date: "2026-07-12",
  },
  {
    id: 6,
    planId: 1,
    subject: "국어",
    title: "현대시 핵심 표현 복습",
    done: true,
    minutes: 45,
    date: "2026-07-06",
  },
  {
    id: 7,
    planId: 2,
    subject: "영어",
    title: "수능특강 독해 4강",
    done: true,
    minutes: 80,
    date: "2026-07-06",
  },
  {
    id: 8,
    planId: 1,
    subject: "과학",
    title: "화학 결합 개념 정리",
    done: true,
    minutes: 55,
    date: "2026-07-07",
  },
  {
    id: 9,
    planId: 2,
    subject: "수학",
    title: "확률과 통계 기출 20문제",
    done: false,
    minutes: 90,
    date: "2026-07-07",
  },
  {
    id: 10,
    planId: 3,
    subject: "수학",
    title: "수행평가 발표 자료 초안",
    done: true,
    minutes: 60,
    date: "2026-07-08",
  },
  {
    id: 11,
    planId: 1,
    subject: "영어",
    title: "영단어 Day 20 암기",
    done: false,
    minutes: 40,
    date: "2026-07-08",
  },
  {
    id: 12,
    planId: 2,
    subject: "국어",
    title: "비문학 기술 지문 3개",
    done: true,
    minutes: 75,
    date: "2026-07-09",
  },
  {
    id: 13,
    planId: 1,
    subject: "수학",
    title: "수열 오답노트 정리",
    done: false,
    minutes: 65,
    date: "2026-07-09",
  },
  {
    id: 14,
    planId: 2,
    subject: "탐구",
    title: "생명과학 세포 분열 복습",
    done: true,
    minutes: 50,
    date: "2026-07-10",
  },
  {
    id: 15,
    planId: 1,
    subject: "국어",
    title: "고전소설 작품 정리",
    done: false,
    minutes: 55,
    date: "2026-07-10",
  },
  {
    id: 16,
    planId: 3,
    subject: "수학",
    title: "발표 리허설 2회",
    done: true,
    minutes: 45,
    date: "2026-07-11",
  },
  {
    id: 17,
    planId: 2,
    subject: "영어",
    title: "듣기 모의고사 1회",
    done: false,
    minutes: 35,
    date: "2026-07-11",
  },
];
function load<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}
function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function loadArray<T>(key: string, fallback: T[]): T[] {
  const value = load<unknown>(key, fallback);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function dDayFor(plan: Plan) {
  if (!plan.targetDate) return plan.dDay;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(plan.targetDate + "T00:00:00");
  const difference = Math.round(
    (target.getTime() - today.getTime()) / 86400000,
  );
  if (difference === 0) return "D-DAY";
  return difference > 0 ? `D-${difference}` : `D+${Math.abs(difference)}`;
}

function progressFor(planId: number, tasks: Task[]) {
  const planTasks = tasks.filter((task) => task.planId === planId);
  if (!planTasks.length) return 0;
  return Math.round(
    (planTasks.filter((task) => task.done).length / planTasks.length) * 100,
  );
}

function useDialogEscape(close: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);
}

function Logo() {
  return (
    <div className="logo">
      <b>A+</b>
    </div>
  );
}
export function PlannerApp() {
  const navigate = useNavigate(),
    location = useLocation(),
    [plans, setPlans] = useState<Plan[]>(() => load("ap-plans", initialPlans)),
    [tasks, setTasks] = useState<Task[]>(() =>
      loadArray<Task>("ap-tasks", initialTasks).map((task) => ({
        ...task,
        date: task.date || "2026-07-12",
      })),
    ),
    [trash, setTrash] = useState<TrashItem[]>(() => load("ap-trash", [])),
    [query, setQuery] = useState(""),
    [modal, setModal] = useState(false),
    [deleting, setDeleting] = useState<Plan | null>(null);
  useEffect(
    () => localStorage.setItem("ap-plans", JSON.stringify(plans)),
    [plans],
  );
  useEffect(
    () => localStorage.setItem("ap-tasks", JSON.stringify(tasks)),
    [tasks],
  );
  useEffect(
    () => localStorage.setItem("ap-trash", JSON.stringify(trash)),
    [trash],
  );
  const toggle = (id: number) =>
      setTasks((t) =>
        t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
      ),
    addTask = (task: Omit<Task, "id" | "done">) =>
      setTasks((t) => [...t, { ...task, id: Date.now(), done: false }]),
    active = location.pathname.startsWith("/planners")
      ? "/planners"
      : location.pathname;
  const removePlan = (p: Plan) => {
    const removed = tasks.filter((t) => t.planId === p.id);
    setTrash((x) => [
      {
        plan: p,
        tasks: removed,
        deletedAt: new Date().toLocaleDateString("ko-KR"),
      },
      ...x,
    ]);
    setPlans((x) => x.filter((v) => v.id !== p.id));
    setTasks((x) => x.filter((v) => v.planId !== p.id));
    setDeleting(null);
    navigate("/trash");
  };
  const folderProps = {
    plans,
    tasks,
    toggle,
    add: () => setModal(true),
    addTask,
    requestDelete: setDeleting,
  };
  return (
    <div className="app">
      <aside className="sidebar">
        <Logo />
        <nav>
          {NAV.map(([path, n, I]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={active === path ? "active" : ""}
            >
              <I />
              {n}
            </button>
          ))}
        </nav>
        <div className="goal">
          <small>이번 주 학습 목표</small>
          <h3>
            18.5h <em>74%</em>
          </h3>
          <i />
        </div>
      </aside>
      <main>
        <header>
          <div className="mobile">
            <Logo />
          </div>
          <div className="search-wrap">
            <div className="search">
              <Search />
              <input
                aria-label="플래너와 할 일 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="플래너, 할 일 검색"
              />
              {query && (
                <button aria-label="검색어 지우기" onClick={() => setQuery("")}>
                  <X />
                </button>
              )}
            </div>
            {query.trim() && (
              <div className="search-results">
                {plans
                  .filter((plan) => plan.name.includes(query.trim()))
                  .slice(0, 3)
                  .map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        navigate(`/planners/${plan.id}`);
                        setQuery("");
                      }}
                    >
                      <Folder />
                      <span>
                        <b>{plan.name}</b>
                        <small>플래너</small>
                      </span>
                    </button>
                  ))}
                {tasks
                  .filter((task) => task.title.includes(query.trim()))
                  .slice(0, 4)
                  .map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        navigate(`/planners/${task.planId}`);
                        setQuery("");
                      }}
                    >
                      <Check />
                      <span>
                        <b>{task.title}</b>
                        <small>
                          {task.subject} · {task.date}
                        </small>
                      </span>
                    </button>
                  ))}
                {!plans.some((plan) => plan.name.includes(query.trim())) &&
                  !tasks.some((task) => task.title.includes(query.trim())) && (
                    <p>검색 결과가 없어요.</p>
                  )}
              </div>
            )}
          </div>
          <span className="avatar">민</span>
        </header>
        <div className="content">
          <PlannerRoutes
            home={
              <HomePage
                plans={plans}
                tasks={tasks}
                toggle={toggle}
                add={() => setModal(true)}
              />
            }
            plannerList={
              <FolderPage
                {...folderProps}
                selected={null}
                select={(id) => id && navigate("/planners/" + id)}
              />
            }
            plannerDetail={<PlannerRoute {...folderProps} />}
            stats={<StatsPage tasks={tasks} />}
            trash={
              <TrashPage
                items={trash}
                restore={(item) => {
                  setPlans((x) => [...x, item.plan]);
                  setTasks((x) => [...x, ...item.tasks]);
                  setTrash((x) => x.filter((v) => v.plan.id !== item.plan.id));
                }}
                permanentlyDelete={(id) => {
                  if (
                    window.confirm(
                      "이 플래너를 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.",
                    )
                  )
                    setTrash((x) => x.filter((v) => v.plan.id !== id));
                }}
              />
            }
          />
        </div>
      </main>
      <nav className="bottom">
        {NAV.map(([path, n, I]) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={active === path ? "active" : ""}
          >
            <I />
            <small>{n}</small>
          </button>
        ))}
      </nav>
      {modal && (
        <PlanModal
          close={() => setModal(false)}
          save={(name, targetDate) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(targetDate + "T00:00:00");
            const days = Math.max(
              0,
              Math.round((target.getTime() - today.getTime()) / 86400000),
            );
            setPlans([
              ...plans,
              {
                id: Date.now(),
                name: name.trim(),
                period: `${today.toLocaleDateString("ko-KR")} - ${target.toLocaleDateString("ko-KR")}`,
                dDay: days === 0 ? "D-DAY" : `D-${days}`,
                color: ["#008cff", "#7c5cff", "#ff8a4c"][plans.length % 3],
                progress: 0,
                targetDate,
              },
            ]);
            setModal(false);
            navigate("/planners");
          }}
        />
      )}
      {deleting && (
        <DeleteModal
          plan={deleting}
          close={() => setDeleting(null)}
          confirm={() => removePlan(deleting)}
        />
      )}
    </div>
  );
}
function PlannerRoute(
  props: Omit<Parameters<typeof FolderPage>[0], "selected" | "select">,
) {
  const { plannerId } = useParams(),
    navigate = useNavigate(),
    id = Number(plannerId);
  if (!props.plans.some((p) => p.id === id))
    return <Navigate to="/planners" replace />;
  return (
    <FolderPage
      {...props}
      selected={id}
      select={(next) => navigate(next ? "/planners/" + next : "/planners")}
    />
  );
}
function PageTitle({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  action?: () => void;
}) {
  return (
    <div className="page-title">
      <div>
        <b>{eyebrow}</b>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action && (
        <button className="primary" onClick={action}>
          <Plus />
          플래너 추가
        </button>
      )}
    </div>
  );
}
function HomePage({
  plans,
  tasks,
  toggle,
  add,
}: {
  plans: Plan[];
  tasks: Task[];
  toggle: (n: number) => void;
  add: () => void;
}) {
  const [date, setDate] = useState("2026-07-12"),
    dayTasks = tasks.filter((x) => x.date === date),
    done = dayTasks.filter((x) => x.done).length,
    totalMinutes = dayTasks.reduce((a, b) => a + b.minutes, 0),
    completedMinutes = dayTasks
      .filter((task) => task.done)
      .reduce((sum, task) => sum + task.minutes, 0);
  const label = Number(date.slice(-2)) + "일";
  return (
    <>
      <PageTitle
        eyebrow={"2026년 7월 " + label}
        title="오늘 공부도 차근차근 시작해요 👋"
        desc="날짜를 선택하면 모든 플래너의 학습 계획을 모아볼 수 있어요."
        action={add}
      />
      <Week selected={date} onSelect={setDate} tasks={tasks} />
      <div className="home-grid">
        <div>
          <section className="card todo">
            <div className="section-head">
              <div>
                <h2>{label} 통합 학습</h2>
                <p>
                  {dayTasks.length}개의 할 일 · 예상 학습{" "}
                  {Math.floor(totalMinutes / 60)}시간 {totalMinutes % 60}분
                </p>
              </div>
              <span className="rate">
                {dayTasks.length
                  ? Math.round((done / dayTasks.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="task-list">
              {dayTasks.length ? (
                dayTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    plan={plans.find((p) => p.id === t.planId)}
                    toggle={toggle}
                  />
                ))
              ) : (
                <EmptyTasks />
              )}
            </div>
          </section>
          <section className="plan-summary">
            <div className="section-head">
              <div>
                <h2>플래너별 진행 상황</h2>
                <p>전체 목표를 한눈에 확인하세요</p>
              </div>
            </div>
            <div className="plan-grid">
              {plans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={{ ...p, progress: progressFor(p.id, tasks) }}
                  count={
                    tasks.filter((t) => t.planId === p.id && !t.done).length
                  }
                />
              ))}
            </div>
          </section>
        </div>
        <aside className="right">
          <StudyTime
            minutes={completedMinutes}
            tasks={tasks}
            selectedDate={date}
          />
          <section className="card focus">
            <h2>선택한 날의 과목 비중</h2>
            {Object.entries(C).map(([s, c]) => {
              const min = dayTasks
                .filter((t) => t.subject === s && t.done)
                .reduce((a, b) => a + b.minutes, 0);
              return (
                <div className="subject-line" key={s}>
                  <i style={{ background: c }} />
                  <span>{s}</span>
                  <u>
                    <b
                      style={{
                        width:
                          (min /
                            Math.max(
                              1,
                              ...Object.keys(C).map((key) =>
                                dayTasks
                                  .filter((task) => task.subject === key)
                                  .reduce((sum, task) => sum + task.minutes, 0),
                              ),
                            )) *
                            100 +
                          "%",
                        background: c,
                      }}
                    />
                  </u>
                  <em>{min}분</em>
                </div>
              );
            })}
          </section>
        </aside>
      </div>
    </>
  );
}
function Week({
  selected,
  onSelect,
  tasks,
}: {
  selected: string;
  onSelect: (d: string) => void;
  tasks: Task[];
}) {
  const selectedDate = new Date(selected + "T00:00:00");
  const days = Array.from({ length: 7 }, (_, index) => {
    const value = new Date(selectedDate);
    value.setDate(selectedDate.getDate() + index - 3);
    return value;
  });
  return (
    <div className="week-shell">
      <input
        className="date-jump"
        aria-label="조회할 날짜"
        type="date"
        value={selected}
        onChange={(event) => onSelect(event.target.value)}
      />
      <div className="week">
        {days.map((day) => {
          const date = toDateKey(day),
            count = tasks.filter((t) => t.date === date).length;
          return (
            <button
              onClick={() => onSelect(date)}
              className={selected === date ? "selected" : ""}
              key={date}
            >
              <small>
                {["일", "월", "화", "수", "목", "금", "토"][day.getDay()]}
              </small>
              <b>{day.getDate()}</b>
              {count > 0 && <i>{count}</i>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function EmptyTasks() {
  return (
    <div className="empty-tasks">
      <CalendarDays />
      <b>등록된 할 일이 없어요</b>
      <p>플래너에서 이 날짜의 학습 계획을 추가해 보세요.</p>
    </div>
  );
}
function TaskRow({
  task: t,
  plan,
  toggle,
}: {
  task: Task;
  plan?: Plan;
  toggle: (n: number) => void;
}) {
  return (
    <button className="task" onClick={() => toggle(t.id)}>
      <i
        style={{
          background: t.done ? C[t.subject] : "white",
          borderColor: C[t.subject],
        }}
      >
        {t.done && <Check />}
      </i>
      <div className="task-copy">
        <div>
          <em style={{ color: C[t.subject], background: C[t.subject] + "16" }}>
            {t.subject}
          </em>
          <small>{plan?.name}</small>
        </div>
        <span className={t.done ? "done" : ""}>{t.title}</span>
      </div>
      <time>{t.minutes}분</time>
    </button>
  );
}
function PlanCard({
  plan: p,
  count,
  onClick,
}: {
  plan: Plan;
  count: number;
  onClick?: () => void;
}) {
  const Card = onClick ? "button" : "article";
  return (
    <Card className="card plan-card" onClick={onClick}>
      <div>
        <span style={{ background: p.color + "18", color: p.color }}>
          {p.name.includes("수능") ? "장기 목표" : "학습 플래너"}
        </span>
        <b>{dDayFor(p)}</b>
      </div>
      <h3>{p.name}</h3>
      <p>{p.period}</p>
      <small>
        <span>남은 할 일 {count}개</span>
        <b style={{ color: p.color }}>{p.progress}%</b>
      </small>
      <i>
        <u style={{ width: p.progress + "%", background: p.color }} />
      </i>
    </Card>
  );
}
function FolderPage({
  plans,
  tasks,
  selected,
  select,
  toggle,
  add,
  addTask,
  requestDelete,
}: {
  plans: Plan[];
  tasks: Task[];
  selected: number | null;
  select: (n: number | null) => void;
  toggle: (n: number) => void;
  add: () => void;
  addTask: (t: Omit<Task, "id" | "done">) => void;
  requestDelete: (p: Plan) => void;
}) {
  const [date, setDate] = useState("2026-07-12"),
    [taskModal, setTaskModal] = useState(false),
    p = plans.find((x) => x.id === selected);
  if (p) {
    const list = tasks.filter((t) => t.planId === p.id && t.date === date),
      done = list.filter((t) => t.done).length,
      progress = progressFor(p.id, tasks);
    return (
      <>
        <button className="back" onClick={() => select(null)}>
          <ChevronLeft />
          전체 폴더
        </button>
        <PageTitle
          eyebrow={dDayFor(p) + " · " + p.period}
          title={p.name}
          desc="날짜별 학습 계획을 만들고 완료 상태를 관리하세요."
        />
        <div className="planner-date-head">
          <div>
            <b>7월 학습 캘린더</b>
            <p>날짜를 눌러 계획을 확인하세요.</p>
          </div>
          <button className="primary" onClick={() => setTaskModal(true)}>
            <Plus />할 일 추가
          </button>
        </div>
        <PlannerDates
          selected={date}
          onSelect={setDate}
          tasks={tasks.filter((t) => t.planId === p.id)}
        />
        <div className="folder-detail">
          <section className="card todo">
            <div className="section-head">
              <div>
                <h2>{Number(date.slice(-2))}일 학습 계획</h2>
                <p>
                  {list.length}개 중 {done}개 완료
                </p>
              </div>
              <span className="rate">
                {list.length ? Math.round((done / list.length) * 100) : 0}%
              </span>
            </div>
            <div className="task-list">
              {list.length ? (
                list.map((t) => (
                  <TaskRow key={t.id} task={t} plan={p} toggle={toggle} />
                ))
              ) : (
                <EmptyTasks />
              )}
            </div>
          </section>
          <section className="card detail-info">
            <Target />
            <h2>목표 달성까지</h2>
            <strong>{dDayFor(p)}</strong>
            <p>계획한 학습량의 {progress}%를 완료했어요.</p>
            <button className="delete-plan" onClick={() => requestDelete(p)}>
              <Trash2 />
              플래너 삭제
            </button>
          </section>
        </div>
        {taskModal && (
          <TaskModal
            plan={{ ...p, progress: progressFor(p.id, tasks) }}
            defaultDate={date}
            close={() => setTaskModal(false)}
            save={(t) => {
              addTask(t);
              setDate(t.date);
              setTaskModal(false);
            }}
          />
        )}
      </>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="MY PLANNERS"
        title="플래너 폴더"
        desc="기말고사, 수능 등 목표별 학습 계획을 따로 관리하세요."
        action={add}
      />
      <div className="folder-toolbar">
        <b>
          전체 폴더 <span>{plans.length}</span>
        </b>
        <small>최근 생성된 순서</small>
      </div>
      <div className="folder-grid">
        {plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={{ ...p, progress: progressFor(p.id, tasks) }}
            count={tasks.filter((t) => t.planId === p.id && !t.done).length}
            onClick={() => select(p.id)}
          />
        ))}
        <button className="new-folder" onClick={add}>
          <Plus />
          <b>새 플래너 만들기</b>
          <small>새로운 시험과 목표를 준비해요</small>
        </button>
      </div>
    </>
  );
}
function PlannerDates({
  selected,
  onSelect,
  tasks,
}: {
  selected: string;
  onSelect: (d: string) => void;
  tasks: Task[];
}) {
  return (
    <div className="planner-dates">
      {Array.from({ length: 14 }, (_, i) => {
        const center = new Date(selected + "T00:00:00");
        const day = new Date(center);
        day.setDate(center.getDate() + i - 6);
        const date = toDateKey(day);
        const n = day.getDate();
        const count = tasks.filter((t) => t.date === date).length;
        return (
          <button
            key={date}
            className={selected === date ? "selected" : ""}
            onClick={() => onSelect(date)}
          >
            <small>
              {["일", "월", "화", "수", "목", "금", "토"][day.getDay()]}
            </small>
            <b>{n}</b>
            <i>{count || "·"}</i>
          </button>
        );
      })}
    </div>
  );
}
function StatsPage({ tasks }: { tasks: Task[] }) {
  const [range, setRange] = useState<"daily" | "monthly">("daily");
  const completed = tasks.filter((task) => task.done);
  const totalMinutes = completed.reduce((sum, task) => sum + task.minutes, 0);
  const latest = tasks.length
    ? new Date(
        [...tasks].sort((a, b) => b.date.localeCompare(a.date))[0].date +
          "T00:00:00",
      )
    : new Date();
  const dailyDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(latest);
    date.setDate(latest.getDate() + index - 6);
    return date;
  });
  const dailyValues = dailyDates.map((date) => {
    const key = toDateKey(date);
    return completed
      .filter((task) => task.date === key)
      .reduce((sum, task) => sum + task.minutes, 0);
  });
  const monthlyValues = Array.from({ length: 12 }, (_, month) =>
    completed
      .filter((task) => Number(task.date.slice(5, 7)) === month + 1)
      .reduce((sum, task) => sum + task.minutes, 0),
  );
  const values = range === "daily" ? dailyValues : monthlyValues;
  const max = Math.max(1, ...values);
  const subjectRows = Object.entries(C).map(([subject, color]) => {
    const minutes = completed
      .filter((task) => task.subject === subject)
      .reduce((sum, task) => sum + task.minutes, 0);
    return {
      subject,
      color,
      minutes,
      percent: totalMinutes ? Math.round((minutes / totalMinutes) * 100) : 0,
    };
  });
  let cursor = 0;
  const gradient = subjectRows
    .map((row) => {
      const start = cursor;
      cursor += row.percent;
      return `${row.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <>
      <PageTitle
        eyebrow="LEARNING REPORT"
        title="학습 통계"
        desc="완료한 학습을 기준으로 기간과 과목별 학습량을 분석했어요."
      />
      <div className="stat-top">
        <article className="card metric">
          <Clock3 />
          <div>
            <small>완료 학습 시간</small>
            <b>
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </b>
            <em>완료한 할 일 기준</em>
          </div>
        </article>
        <article className="card metric">
          <Target />
          <div>
            <small>전체 달성률</small>
            <b>
              {tasks.length
                ? Math.round((completed.length / tasks.length) * 100)
                : 0}
              %
            </b>
            <em>모든 플래너 합산</em>
          </div>
        </article>
        <article className="card metric">
          <Check />
          <div>
            <small>완료한 학습</small>
            <b>{completed.length}개</b>
            <em>전체 {tasks.length}개 중</em>
          </div>
        </article>
      </div>
      <div className="stats-grid">
        <section
          className="card chart-card"
          aria-labelledby="volume-chart-title"
        >
          <div className="chart-head">
            <div>
              <h2 id="volume-chart-title">
                {range === "daily" ? "일별" : "월별"} 완료 학습량
              </h2>
              <p>완료 처리한 공부 시간</p>
            </div>
            <div className="toggle" role="group" aria-label="통계 기간">
              <button
                className={range === "daily" ? "active" : ""}
                aria-pressed={range === "daily"}
                onClick={() => setRange("daily")}
              >
                일별
              </button>
              <button
                className={range === "monthly" ? "active" : ""}
                aria-pressed={range === "monthly"}
                onClick={() => setRange("monthly")}
              >
                월별
              </button>
            </div>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label={values
              .map(
                (value, index) =>
                  `${range === "daily" ? dailyDates[index].toLocaleDateString("ko-KR", { weekday: "short" }) : index + 1 + "월"} ${value}분`,
              )
              .join(", ")}
          >
            {values.map((value, index) => (
              <div key={index}>
                <span>
                  <i style={{ height: (value / max) * 100 + "%" }} />
                  <b>
                    {value ? Math.round((value / 60) * 10) / 10 + "h" : "0"}
                  </b>
                </span>
                <small>
                  {range === "daily"
                    ? dailyDates[index].toLocaleDateString("ko-KR", {
                        weekday: "short",
                      })
                    : index + 1 + "월"}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="card donut-card">
          <h2>과목별 학습 비중</h2>
          <p>완료한 학습 누적 기준</p>
          <div
            className="donut"
            role="img"
            aria-label={subjectRows
              .map((row) => `${row.subject} ${row.percent}%`)
              .join(", ")}
            style={{
              background: totalMinutes
                ? `conic-gradient(${gradient})`
                : "#e2e8f0",
            }}
          >
            <strong>
              {Math.round((totalMinutes / 60) * 10) / 10}h<small>총 학습</small>
            </strong>
          </div>
          <div className="legend">
            {subjectRows.map((row) => (
              <div key={row.subject}>
                <i style={{ background: row.color }} />
                <span>{row.subject}</span>
                <b>
                  {Math.floor(row.minutes / 60)}h {row.minutes % 60}m
                </b>
                <em>{row.percent}%</em>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function StudyTime({
  minutes,
  tasks,
  selectedDate,
}: {
  minutes: number;
  tasks: Task[];
  selectedDate: string;
}) {
  const selected = new Date(selectedDate + "T00:00:00");
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selected);
    date.setDate(selected.getDate() + index - 6);
    const key = toDateKey(date);
    const value = tasks
      .filter((task) => task.date === key && task.done)
      .reduce((sum, task) => sum + task.minutes, 0);
    return {
      label: ["일", "월", "화", "수", "목", "금", "토"][date.getDay()],
      value,
    };
  });
  const max = Math.max(1, ...days.map((day) => day.value));
  return (
    <section className="study-time">
      <div className="study-time-head">
        <div>
          <p>선택한 날 완료 학습 시간</p>
          <h2>
            {Math.floor(minutes / 60)}h {minutes % 60}m
          </h2>
        </div>
        <Clock3 aria-hidden="true" />
      </div>
      <div
        className="study-bars"
        role="img"
        aria-label={days
          .map((day) => `${day.label}요일 ${day.value}분`)
          .join(", ")}
      >
        {days.map((day, index) => (
          <div
            key={index}
            className={index === days.length - 1 ? "selected" : ""}
          >
            <span>
              {index === days.length - 1 && <em>{day.value}분</em>}
              <i
                style={{
                  height: day.value
                    ? `${Math.max(6, (day.value / max) * 100)}%`
                    : "0%",
                }}
              />
            </span>
            <small>{day.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
function TaskModal({
  plan,
  defaultDate,
  close,
  save,
}: {
  plan: Plan;
  defaultDate: string;
  close: () => void;
  save: (t: Omit<Task, "id" | "done">) => void;
}) {
  const [title, setTitle] = useState(""),
    [subject, setSubject] = useState("수학"),
    [date, setDate] = useState(defaultDate),
    [minutes, setMinutes] = useState(50),
    valid = title.trim().length > 1;
  useDialogEscape(close);
  return (
    <div className="overlay">
      <div
        className="modal task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <button className="modal-close" aria-label="닫기" onClick={close}>
          <X />
        </button>
        <b>ADD STUDY TASK</b>
        <h2 id="task-modal-title">날짜별 할 일 추가</h2>
        <p>
          <strong>{plan.name}</strong>에 새로운 학습 계획을 추가합니다.
        </p>
        <label>
          날짜
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            과목
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {Object.keys(C).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            예상 시간
            <input
              type="number"
              min="10"
              step="10"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(10, +e.target.value))}
            />
            <span className="input-unit">분</span>
          </label>
        </div>
        <label>
          할 일
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid)
                save({
                  planId: plan.id,
                  subject,
                  title: title.trim(),
                  date,
                  minutes,
                });
            }}
            placeholder="예: 미적분 문제집 42~48p"
          />
        </label>
        <button
          className="primary"
          disabled={!valid}
          onClick={() =>
            save({
              planId: plan.id,
              subject,
              title: title.trim(),
              date,
              minutes,
            })
          }
        >
          <Plus />할 일 추가
        </button>
      </div>
    </div>
  );
}
function TrashPage({
  items,
  restore,
  permanentlyDelete,
}: {
  items: TrashItem[];
  restore: (x: TrashItem) => void;
  permanentlyDelete: (id: number) => void;
}) {
  return (
    <>
      <PageTitle
        eyebrow="TRASH"
        title="휴지통"
        desc="삭제한 플래너는 이곳에 보관됩니다."
      />
      <div className="trash-guide">
        <Trash2 />
        <p>삭제된 플래너는 직접 영구 삭제하기 전까지 보관돼요.</p>
      </div>
      {items.length === 0 ? (
        <div className="empty-trash">
          <Trash2 />
          <h2>휴지통이 비어 있어요</h2>
          <p>삭제한 플래너가 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="trash-grid">
          {items.map((item) => (
            <article className="card trash-card" key={item.plan.id}>
              <div className="trash-icon">
                <Trash2 />
              </div>
              <div>
                <small>{item.deletedAt} 삭제됨</small>
                <h3>{item.plan.name}</h3>
                <p>
                  학습 계획 {item.tasks.length}개 · 진행률{" "}
                  {progressFor(item.plan.id, item.tasks)}%
                </p>
              </div>
              <div className="trash-actions">
                <button onClick={() => restore(item)}>
                  <RotateCcw />
                  복원
                </button>
                <button onClick={() => permanentlyDelete(item.plan.id)}>
                  <Trash2 />
                  영구 삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function DeleteModal({
  plan,
  close,
  confirm,
}: {
  plan: Plan;
  close: () => void;
  confirm: () => void;
}) {
  const [text, setText] = useState(""),
    matched = text === plan.name;
  useDialogEscape(close);
  return (
    <div className="overlay">
      <div
        className="modal delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <button className="modal-close" aria-label="닫기" onClick={close}>
          <X />
        </button>
        <div className="danger-icon">
          <Trash2 />
        </div>
        <h2 id="delete-modal-title">플래너를 삭제할까요?</h2>
        <p>
          플래너와 포함된 모든 학습 계획이 휴지통으로 이동합니다. 계속하려면
          아래에 플래너 제목을 정확히 입력하세요.
        </p>
        <div className="confirm-name">{plan.name}</div>
        <label>
          플래너 제목
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={plan.name}
          />
        </label>
        {text && !matched && (
          <small className="error-text">플래너 제목이 일치하지 않습니다.</small>
        )}
        <div className="modal-actions">
          <button onClick={close}>취소</button>
          <button
            className="danger-button"
            disabled={!matched}
            onClick={confirm}
          >
            <Trash2 />
            휴지통으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
function PlanModal({
  close,
  save,
}: {
  close: () => void;
  save: (name: string, targetDate: string) => void;
}) {
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const valid = name.trim().length >= 2 && Boolean(targetDate);
  useDialogEscape(close);

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-plan-title"
      >
        <button className="modal-close" aria-label="닫기" onClick={close}>
          <X />
        </button>
        <b>NEW PLANNER</b>
        <h2 id="new-plan-title">새 플래너 폴더 만들기</h2>
        <p>시험이나 장기 목표 단위로 계획을 분리해 보세요.</p>
        <label>
          플래너 이름
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 2학기 기말고사"
          />
        </label>
        <label>
          목표일
          <input
            type="date"
            min={toDateKey(new Date())}
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </label>
        <button
          className="primary"
          disabled={!valid}
          onClick={() => save(name, targetDate)}
        >
          플래너 만들기
        </button>
      </div>
    </div>
  );
}


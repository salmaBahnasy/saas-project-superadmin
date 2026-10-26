import { useState } from "react";
import { assignCompanyResponsible, updateCompanyResponsible } from "../../api/companies";
import { Banner } from "../ui/Feedback.jsx";

export function ResponsibleUserSection({ company, onAssigned }) {
  const [mode, setMode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const admin = company.responsibleUser;
  function open(nextMode) {
    setMode(nextMode);
    setName(nextMode === "edit" ? admin.name : "");
    setEmail(nextMode === "edit" ? admin.email : "");
    setPassword("");
    setError("");
    setNotice("");
  }
  async function save(event) {
    event.preventDefault();
    const payload = { name, email, ...(password ? { password } : {}) };
    await write(() => mode === "assign" ? assignCompanyResponsible(company.id, { name, email, password }) : updateCompanyResponsible(company.id, payload));
  }
  async function write(action) {
    setSaving(true); setError(""); setNotice("");
    try {
      const { data } = await action();
      onAssigned(data.admin);
      setMode("");
      setNotice("تم حفظ بيانات مسؤول الشركة.");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); setPassword(""); }
  }
  return (
    <section className="panel stack" dir="rtl" aria-labelledby="responsible-user-title">
      <div className="spread">
        <h2 id="responsible-user-title">مسؤول الشركة</h2>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => open("assign")}>{admin ? "تغيير مسؤول الشركة" : "إضافة مسؤول"}</button>
      </div>
      {error ? <Banner>{error}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}
      {admin ? (
        <div className="stack">
          <div><strong>الاسم الكامل: </strong>{admin.name}</div>
          <div><strong>البريد الإلكتروني: </strong><span dir="ltr">{admin.email}</span></div>
          <div><strong>الدور: </strong><span dir="ltr">{admin.role}</span></div>
          <div><strong>حالة المستخدم: </strong>{admin.is_active === false ? "موقوف" : "نشط"}</div>
          <div className="row">
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => open("edit")}>تعديل البيانات / تغيير كلمة المرور</button>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => write(() => updateCompanyResponsible(company.id, { is_active: admin.is_active === false }))}>{admin.is_active === false ? "تفعيل تسجيل الدخول" : "إيقاف تسجيل الدخول"}</button>
          </div>
        </div>
      ) : <p className="muted">لم يتم تعيين مسؤول لهذه الشركة بعد.</p>}
      {mode ? (
        <form className="stack" onSubmit={save}>
          <div className="field">
            <label htmlFor="responsible-name">الاسم الكامل</label>
            <input id="responsible-name" className="input" required maxLength={120} autoComplete="name" value={name} onChange={event => setName(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="responsible-email">البريد الإلكتروني</label>
            <input id="responsible-email" className="input" type="email" required maxLength={254} dir="ltr" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="responsible-password">{mode === "edit" ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}</label>
            <input id="responsible-password" className="input" type="password" required={mode === "assign"} minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} />
          </div>
          <p className="muted">يستخدم المسؤول تسجيل دخول الشركات المعتاد. يحتفظ باقي المستخدمين والموظفين بحساباتهم وبياناتهم.</p>
          <div className="row">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "جارٍ الحفظ…" : "حفظ المسؤول"}</button>
            <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => { setMode(""); setPassword(""); }}>إلغاء</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

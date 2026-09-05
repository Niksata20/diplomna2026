import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

export default function ProjectDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [stages, setStages] = useState([]);
    const [tasks, setTasks] = useState({});
    const [stageForm, setStageForm] = useState({ title: '', description: '' });
    const [taskForms, setTaskForms] = useState({});
    const [applyMsg, setApplyMsg] = useState('');
    const [file, setFile] = useState(null);
    const [applied, setApplied] = useState(false);
    const [editProject, setEditProject] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editingStageId, setEditingStageId] = useState(null);
    const [stageEditForm, setStageEditForm] = useState({});
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskEditForm, setTaskEditForm] = useState({});

    useEffect(() => {
        axios.get(`/projects/${id}`).then(res => {
            setProject(res.data);
            setEditForm({ title: res.data.title, description: res.data.description, deadline: res.data.deadline?.split('T')[0] || '', status: res.data.status });
        });
        loadStages();
    }, [id]);

    const loadStages = async () => {
        const res = await axios.get(`/stages/project/${id}`);
        setStages(res.data);
        res.data.forEach(st => loadTasks(st.id));
    };

    const loadTasks = async (stageId) => {
        const res = await axios.get(`/tasks/stage/${stageId}`);
        setTasks(prev => ({ ...prev, [stageId]: res.data }));
    };

    const handleApply = async () => {
        const data = new FormData();
        data.append('project_id', id);
        data.append('message', applyMsg);
        if (file) data.append('document', file);
        await axios.post('/applications', data);
        setApplied(true);
    };

    const handleAddStage = async () => {
        if (!stageForm.title) return;
        await axios.post('/stages', { ...stageForm, project_id: id });
        setStageForm({ title: '', description: '' });
        loadStages();
    };

    const handleAddTask = async (stageId) => {
        const form = taskForms[stageId] || {};
        if (!form.title) return;
        await axios.post('/tasks', { ...form, stage_id: stageId });
        setTaskForms({ ...taskForms, [stageId]: { title: '' } });
        loadTasks(stageId);
    };

    const handleTaskStatus = async (taskId, status, stageId) => {
        await axios.put(`/tasks/${taskId}`, { ...taskEditForm, status });
        loadTasks(stageId);
    };

    const handleStageStatus = async (stageId, status) => {
        await axios.put(`/stages/${stageId}`, { ...stageEditForm, status });
        loadStages();
    };

    const handleSaveProject = async () => {
        await axios.put(`/projects/${id}`, editForm);
        setProject({ ...project, ...editForm });
        setEditProject(false);
    };

    // --- Stage edit ---
    const startEditStage = (stage) => {
        setEditingStageId(stage.id);
        setStageEditForm({ title: stage.title, description: stage.description || '', status: stage.status });
    };

    const cancelEditStage = () => {
        setEditingStageId(null);
        setStageEditForm({});
    };

    const saveEditStage = async (stageId) => {
        await axios.put(`/stages/${stageId}`, stageEditForm);
        setEditingStageId(null);
        loadStages();
    };

    const handleDeleteStage = async (stageId) => {
        if (!window.confirm('Изтриване на етапа ще изтрие и всички негови задачи. Продължи?')) return;
        await axios.delete(`/stages/${stageId}`);
        loadStages();
    };

    // --- Task edit ---
    const startEditTask = (task) => {
        setEditingTaskId(task.id);
        setTaskEditForm({ title: task.title, description: task.description || '', status: task.status, deadline: task.deadline?.split('T')[0] || '' });
    };

    const cancelEditTask = () => {
        setEditingTaskId(null);
        setTaskEditForm({});
    };

    const saveEditTask = async (taskId, stageId) => {
        await axios.put(`/tasks/${taskId}`, taskEditForm);
        setEditingTaskId(null);
        loadTasks(stageId);
    };

    const handleDeleteTask = async (taskId, stageId) => {
        if (!window.confirm('Сигурен ли си, че искаш да изтриеш задачата?')) return;
        await axios.delete(`/tasks/${taskId}`);
        loadTasks(stageId);
    };

    const statusColors = { active: '#4ade80', completed: '#60a5fa', terminated: '#ff6b81', pending: '#fbbf24', in_progress: '#60a5fa' };

    if (!project) return <p style={{ padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Зареждане...</p>;

    return (
        <div style={s.container}>
            <div style={s.header}>
                {editProject ? (
                    <div style={s.editBox}>
                        <input style={s.input} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Заглавие" />
                        <textarea style={{ ...s.input, height: '80px' }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Описание" />
                        <input style={s.input} type="date" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
                        <select style={s.input} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                            <option value="active">Активен</option>
                            <option value="completed">Завършен</option>
                            <option value="terminated">Прекратен</option>
                        </select>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={s.btn} onClick={handleSaveProject}>Запази</button>
                            <button style={s.btnGhost} onClick={() => setEditProject(false)}>Отказ</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 style={s.title}>{project.title}</h1>
                        <p style={s.desc}>{project.description}</p>
                        <p style={s.meta}>
                            Статус: <strong style={{ color: statusColors[project.status] }}>{project.status}</strong> · Краен срок: {project.deadline?.split('T')[0] || 'Няма'}
                        </p>
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button style={{ ...s.btnGhost, marginTop: '10px' }} onClick={() => setEditProject(true)}>Редактирай проекта</button>
                        )}
                    </>
                )}
            </div>

            <hr style={s.hr} />

            <h2 style={s.sectionTitle}>Кандидатствай</h2>
            {applied ? (
                <p style={{ color: '#4ade80', fontWeight: 'bold' }}>Кандидатурата е подадена успешно!</p>
            ) : (
                <div style={s.applyBox}>
                    <textarea style={s.textarea} placeholder="Съобщение до администратора..." value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
                    <label style={s.fileLabel}>
                        Прикачи документ (PDF, DOC):
                        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: '8px' }} />
                    </label>
                    {file && <p style={{ color: '#4ade80', fontSize: '0.85rem' }}>Избран: {file.name}</p>}
                    <button style={s.btn} onClick={handleApply}>Подай кандидатура</button>
                </div>
            )}

            <hr style={s.hr} />

            <h2 style={s.sectionTitle}>Етапи на изпълнение</h2>

            {(user?.role === 'admin' || user?.role === 'manager') && (
                <div style={s.form}>
                    <input style={s.input} placeholder="Заглавие на етап" value={stageForm.title}
                        onChange={e => setStageForm({ ...stageForm, title: e.target.value })} />
                    <input style={s.input} placeholder="Описание" value={stageForm.description}
                        onChange={e => setStageForm({ ...stageForm, description: e.target.value })} />
                    <button style={s.btn} onClick={handleAddStage}>+ Добави етап</button>
                </div>
            )}

            {stages.map(stage => (
                <div key={stage.id} style={s.stage}>
                    {editingStageId === stage.id ? (
                        <div style={s.editBox}>
                            <input style={s.input} value={stageEditForm.title} onChange={e => setStageEditForm({ ...stageEditForm, title: e.target.value })} placeholder="Заглавие на етап" />
                            <textarea style={{ ...s.input, height: '60px' }} value={stageEditForm.description} onChange={e => setStageEditForm({ ...stageEditForm, description: e.target.value })} placeholder="Описание" />
                            <select style={s.input} value={stageEditForm.status} onChange={e => setStageEditForm({ ...stageEditForm, status: e.target.value })}>
                                <option value="pending">Чакащ</option>
                                <option value="in_progress">В процес</option>
                                <option value="completed">Завършен</option>
                            </select>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={s.btnSmall} onClick={() => saveEditStage(stage.id)}>Запази</button>
                                <button style={s.btnGhost} onClick={cancelEditStage}>Отказ</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={s.stageHeader}>
                                <h3 style={s.stageTitle}>{stage.title}</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select value={stage.status} onChange={e => handleStageStatus(stage.id, e.target.value)} style={s.select}>
                                        <option value="pending">Чакащ</option>
                                        <option value="in_progress">В процес</option>
                                        <option value="completed">Завършен</option>
                                    </select>
                                    {(user?.role === 'admin' || user?.role === 'manager') && (
                                        <>
                                            <button style={s.iconBtn} onClick={() => startEditStage(stage)}>Редактирай</button>
                                            {user?.role === 'admin' && (
                                                <button style={s.iconBtnDanger} onClick={() => handleDeleteStage(stage.id)}>Изтрий</button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            {stage.description && <p style={s.stageDesc}>{stage.description}</p>}
                        </>
                    )}

                    <p style={s.tasksLabel}>Задачи:</p>
                    {(tasks[stage.id] || []).map(task => (
                        <div key={task.id} style={s.task}>
                            {editingTaskId === task.id ? (
                                <div style={{ ...s.editBox, width: '100%' }}>
                                    <input style={s.input} value={taskEditForm.title} onChange={e => setTaskEditForm({ ...taskEditForm, title: e.target.value })} placeholder="Заглавие на задача" />
                                    <textarea style={{ ...s.input, height: '50px' }} value={taskEditForm.description} onChange={e => setTaskEditForm({ ...taskEditForm, description: e.target.value })} placeholder="Описание" />
                                    <input style={s.input} type="date" value={taskEditForm.deadline} onChange={e => setTaskEditForm({ ...taskEditForm, deadline: e.target.value })} />
                                    <select style={s.input} value={taskEditForm.status} onChange={e => setTaskEditForm({ ...taskEditForm, status: e.target.value })}>
                                        <option value="pending">Чакаща</option>
                                        <option value="in_progress">В процес</option>
                                        <option value="completed">Завършена</option>
                                    </select>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={s.btnSmall} onClick={() => saveEditTask(task.id, stage.id)}>Запази</button>
                                        <button style={s.btnGhost} onClick={cancelEditTask}>Отказ</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <span style={{ color: 'white' }}>{task.title}</span>
                                        {task.description && <p style={s.taskDesc}>{task.description}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <select value={task.status} onChange={e => handleTaskStatus(task.id, e.target.value, stage.id)} style={s.select}>
                                            <option value="pending">Чакаща</option>
                                            <option value="in_progress">В процес</option>
                                            <option value="completed">Завършена</option>
                                        </select>
                                        {(user?.role === 'admin' || user?.role === 'manager') && (
                                            <>
                                                <button style={s.iconBtn} onClick={() => startEditTask(task)}>Редактирай</button>
                                                {user?.role === 'admin' && (
                                                    <button style={s.iconBtnDanger} onClick={() => handleDeleteTask(task.id, stage.id)}>Изтрий</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {(tasks[stage.id] || []).length === 0 && <p style={s.noTasks}>Няма задачи</p>}

                    {(user?.role === 'admin' || user?.role === 'manager') && (
                        <div style={{ ...s.form, marginTop: '12px' }}>
                            <input style={s.input} placeholder="Нова задача..." value={taskForms[stage.id]?.title || ''}
                                onChange={e => setTaskForms({ ...taskForms, [stage.id]: { ...taskForms[stage.id], title: e.target.value } })} />
                            <button style={s.btnSmall} onClick={() => handleAddTask(stage.id)}>+ Добави</button>
                        </div>
                    )}
                </div>
            ))}
            {stages.length === 0 && <p style={s.noTasks}>Няма добавени етапи.</p>}
        </div>
    );
}

const s = {
    container: { padding: '40px 44px', maxWidth: '850px' },
    header: { marginBottom: '10px' },
    title: { color: 'white', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '600' },
    desc: { color: 'rgba(255,255,255,0.5)', marginBottom: '8px' },
    meta: { color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' },
    hr: { margin: '30px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)' },
    sectionTitle: { color: 'white', fontSize: '1.15rem', fontWeight: '600', marginBottom: '14px' },
    applyBox: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' },
    textarea: { padding: '11px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#14141f', color: 'white', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' },
    fileLabel: { display: 'flex', flexDirection: 'column', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
    form: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' },
    input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#14141f', color: 'white', flex: '1', minWidth: '150px', fontSize: '0.9rem' },
    btn: { padding: '10px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' },
    btnGhost: { padding: '9px 18px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    btnSmall: { padding: '9px 16px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
    iconBtn: { padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '500' },
    iconBtnDanger: { padding: '6px 12px', backgroundColor: 'rgba(233,69,96,0.14)', color: '#ff6b81', border: '1px solid rgba(233,69,96,0.25)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '500' },
    stage: { backgroundColor: '#14141f', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', borderRadius: '14px', marginBottom: '14px' },
    stageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
    stageTitle: { color: 'white', margin: 0, fontSize: '1rem', fontWeight: '600' },
    stageDesc: { color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: '0 0 12px' },
    tasksLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', marginTop: '14px' },
    task: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' },
    taskDesc: { color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: '4px 0 0' },
    noTasks: { color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' },
    select: { padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a12', color: 'white', fontSize: '0.85rem' },
    editBox: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }
};

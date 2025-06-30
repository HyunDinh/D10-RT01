import styles from "../styles/AnswerQuestion/QuestionList.module.css";
import React from "react";

const DeleteConfirmDialog = ({sh,onConfirm, onCancel,message}) => {
    if (!sh) return null;

    return (<div className={styles.dialogOverlay}>
        <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>Confirm Delete</h3>
            <p className={styles.dialogMessage}>{message}</p>
            <div className={styles.dialogButtons}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
                    Hủy
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm}>
                    Xác nhận
                </button>
            </div>
        </div>
    </div>);
};

export default DeleteConfirmDialog;
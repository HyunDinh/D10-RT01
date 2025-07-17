import styles from "../styles/AnswerQuestion/QuestionList.module.css";
import React from "react";
import {useTranslation} from 'react-i18next';

const DeleteConfirmDialog = ({sh, onConfirm, onCancel, message}) => {
    if (!sh) return null;
    const {t} = useTranslation();

    return (<div className={styles.dialogOverlay}>
        <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>{t('dialogTitle', 'Confirm Delete')}</h3>
            <p className={styles.dialogMessage}>{message}</p>
            <div className={styles.dialogButtons}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
                    {t('deleteButton', 'Delete')}
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm}>
                    {t('confirmButton', 'Confirm')}
                </button>
            </div>
        </div>
    </div>);
};

export default DeleteConfirmDialog;
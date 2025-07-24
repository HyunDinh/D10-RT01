import React from "react";
import styles from "../styles/Dialog.module.css";

const Dialog = ({ children, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
};

export default Dialog;

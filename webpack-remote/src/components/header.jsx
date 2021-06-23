import React from "react";

import styles from "./header.module.css";

export default function Header({ children }) {
  return <header className={styles.header}>{children}</header>;
}

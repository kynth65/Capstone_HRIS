import React from "react";
import { Modal, Button } from "@mui/material";

const ConfirmationModal = ({ open, onClose, onConfirm, message }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                <h2>Confirmation</h2>
                <p>{message}</p>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "20px",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={onConfirm}
                        color="primary"
                    >
                        Yes
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        color="secondary"
                    >
                        No
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;

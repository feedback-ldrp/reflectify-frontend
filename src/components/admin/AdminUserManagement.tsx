"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Input, Select, Table, Modal, message } from "antd";
import {
  Designation,
  adminDesignationOptions,
} from "../../constants/designations";
import api from "../../lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  designation: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    designation: "HOD",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin-users");
      // Type assertion to fix 'unknown' type error
      const data = (res.data as { status: string; data: AdminUser[] }).data;
      setAdmins(data);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) message.error("Not authenticated — please log in.");
      else if (status === 403)
        message.error("Access denied — super admin only.");
      else message.error("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditUser(user);
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        designation: user.designation,
      });
    } else {
      setEditUser(null);
      setForm({ name: "", email: "", password: "", designation: "HOD" });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        await api.patch(`/api/v1/admin-users/${editUser.id}`, form);
        message.success("Admin updated");
      } else {
        await api.post("/api/v1/admin-users", form);
        message.success("Admin created");
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) message.error("Not authenticated — please log in.");
      else if (status === 403)
        message.error("Access denied — super admin only.");
      else message.error("Failed to save admin user");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this admin?",
      onOk: async () => {
        try {
          await api.delete(`/api/v1/admin-users/${id}`);
          message.success("Admin deleted");
          fetchAdmins();
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 401)
            message.error("Not authenticated — please log in.");
          else if (status === 403)
            message.error("Access denied — super admin only.");
          else message.error("Failed to delete admin user");
        }
      },
    });
  };

  return (
    <Card
      title="Manage Admin Users"
      style={{ maxWidth: 900, margin: "2rem auto" }}
    >
      <Button
        type="primary"
        onClick={() => handleOpenModal()}
        style={{ marginBottom: 16 }}
      >
        Add Admin User
      </Button>
      <Table
        dataSource={admins}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Designation", dataIndex: "designation" },
          {
            title: "Created",
            dataIndex: "createdAt",
            render: (v) => new Date(v).toLocaleString(),
          },
          {
            title: "Updated",
            dataIndex: "updatedAt",
            render: (v) => new Date(v).toLocaleString(),
          },
          {
            title: "Actions",
            render: (_, record) => (
              <>
                <Button
                  size="small"
                  onClick={() => handleOpenModal(record)}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
              </>
            ),
          },
        ]}
      />
      <Modal
        open={modalOpen}
        title={editUser ? "Edit Admin User" : "Add Admin User"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editUser ? "Update" : "Create"}
      >
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={{ marginBottom: 12 }}
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          style={{ marginBottom: 12 }}
          disabled={!!editUser}
        />
        <Input.Password
          placeholder={
            editUser ? "New Password (leave blank to keep)" : "Password"
          }
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          style={{ marginBottom: 12 }}
        />
        <Select
          value={form.designation}
          options={adminDesignationOptions}
          onChange={(v) => setForm((f) => ({ ...f, designation: v }))}
          style={{ width: "100%" }}
        />
      </Modal>
    </Card>
  );
}

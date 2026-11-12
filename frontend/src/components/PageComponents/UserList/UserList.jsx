import { useEffect, useState } from "react";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

// api requests
import api from "../../../utils/api";

// admin page: every account, with its role and a Delete button
const UserList = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // load users when the page opens
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user");
        setUsers(response.data);
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        console.error("Error fetching users:", error);
        setError("The users didn't load. Refresh the page to try again.");
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, [user]);

  // change a user's role
  const handleRoleChange = async (account, role) => {
    setError(null);
    setNotice(null);

    try {
      const response = await api.patch(`/user/${account._id}`, { role });

      // swap the changed user into the list in state, no page reload needed
      setUsers(users.map((u) => (u._id === account._id ? response.data : u)));
      setNotice(`${account.username} is now ${role === "admin" ? "an admin" : "a visitor"}.`);
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      console.error("Error changing role:", error);
      setError(`${account.username}'s role wasn't changed. Try again in a moment.`);
    }
  };

  // delete a user
  const handleDelete = async (account) => {
    if (!window.confirm(`Delete ${account.username}'s account?`)) {
      return;
    }
    setError(null);
    setNotice(null);

    try {
      await api.delete(`/user/${account._id}`);

      // take it out of the list in state
      setUsers(users.filter((u) => u._id !== account._id));
      setNotice("User deleted.");
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      console.error("Error deleting user:", error);
      setError(`${account.username} wasn't deleted. Try again in a moment.`);
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">Users</h1>

      {notice && (
        <div className="notice page-notice" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="notice notice--error page-notice" role="alert">
          {error}
        </div>
      )}
      {isLoading && <p>Loading the users.</p>}

      <ul className="user-list">
        {users.map((account) => {
          // the admin can't change or delete their own account (the server refuses it too)
          const isMe = account._id === user.userId;

          return (
            <li className="user-row" key={account._id}>
              <div>
                <span className="user-row__name">{account.username}</span>
                <span className="user-row__email">
                  {account.email}
                  {isMe && ", you"}
                </span>
              </div>

              {!isMe && (
                <div className="user-row__actions">
                  <label className="sr-only" htmlFor={`role-${account._id}`}>
                    Role of {account.username}
                  </label>
                  <select
                    className="field__control user-row__role"
                    id={`role-${account._id}`}
                    value={account.role}
                    onChange={(e) => handleRoleChange(account, e.target.value)}
                  >
                    <option value="user">Visitor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => handleDelete(account)}
                  >
                    Delete user
                  </button>
                </div>
              )}
              {isMe && <span className="user-row__email">Admin</span>}
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default UserList;

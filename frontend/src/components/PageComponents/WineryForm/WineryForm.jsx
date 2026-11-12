import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

// my components
import TextField from "../../InputComponents/TextField/TextField";

// api requests
import api from "../../../utils/api";

// one form for both jobs: /winery/new adds a winery, /winery/:id/edit changes one
const WineryForm = () => {
  const { id } = useParams(); // undefined on /winery/new
  const isEdit = Boolean(id);

  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // when editing, load the winery and fill the fields with it
  useEffect(() => {
    const fetchWinery = async () => {
      try {
        const response = await api.get(`/winery/${id}`);
        const winery = response.data.winery;

        // ?? "" because an input's value can't be null or undefined
        setName(winery.name);
        setCountry(winery.country);
        setRegion(winery.region ?? "");
        setFoundedYear(winery.foundedYear);
        setLogoUrl(winery.logoUrl ?? "");
        setDescription(winery.description ?? "");
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        console.error("Error loading the winery form:", error);
        setError("The form didn't load. Refresh the page to try again.");
      }
    };

    if (isEdit) {
      fetchWinery();
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmptyFields([]);

    const winery = { name, country, region, foundedYear, logoUrl, description };

    setIsLoading(true);
    try {
      // PATCH changes an existing winery, POST makes a new one
      const response = isEdit
        ? await api.patch(`/winery/${id}`, winery)
        : await api.post("/winery", winery);

      navigate(`/winery/${response.data._id}`, { state: { notice: "Winery saved." } });
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      // the server lists the required fields that were left empty
      setEmptyFields(error.response?.data.emptyFields || []);
      setError("The winery wasn't saved. Check the fields and try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="page">
      <h1 className="page-title">{isEdit ? "Edit winery" : "Add winery"}</h1>

      <form className="form" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          id="name"
          value={name}
          setSpecificState={setName}
          error={emptyFields.includes("name") ? "Enter the winery's name." : null}
        />

        <div className="form__row">
          <TextField
            label="Country"
            id="country"
            placeholder="Croatia"
            value={country}
            setSpecificState={setCountry}
            error={emptyFields.includes("country") ? "Enter a country." : null}
          />

          <TextField
            label="Region"
            id="region"
            placeholder="Kutjevo, Slavonia"
            value={region}
            setSpecificState={setRegion}
          />

          <TextField
            label="Founded"
            id="foundedYear"
            type="number"
            placeholder="1904"
            value={foundedYear}
            setSpecificState={setFoundedYear}
            error={emptyFields.includes("foundedYear") ? "Enter the founding year." : null}
          />
        </div>

        <TextField
          label="Logo address"
          id="logoUrl"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          setSpecificState={setLogoUrl}
          help="A link to an image. Without one, the winery's first letter is shown."
        />

        <div className="field">
          <label className="field__label" htmlFor="description">
            Description
          </label>
          <textarea
            className="field__control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="notice notice--error" role="alert">
            {error}
          </div>
        )}

        <div className="action-row">
          <button className="btn btn--primary" type="submit" disabled={isLoading}>
            {isEdit ? "Save winery" : "Add winery"}
          </button>
          <Link className="btn btn--text" to={isEdit ? `/winery/${id}` : "/wineries"}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
};

export default WineryForm;

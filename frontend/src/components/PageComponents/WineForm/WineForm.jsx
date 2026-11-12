import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

// my components
import TextField from "../../InputComponents/TextField/TextField";

// api requests
import api from "../../../utils/api";

const wineTypes = ["Red", "White", "Rosé", "Sparkling", "Dessert"];

// one form for both jobs: /wine/new adds a wine, /wine/:id/edit changes one
const WineForm = () => {
  const { id } = useParams(); // undefined on /wine/new
  const isEdit = Boolean(id);

  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [vintage, setVintage] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [colour, setColour] = useState("");
  const [region, setRegion] = useState("");
  const [price, setPrice] = useState("");
  const [winery, setWinery] = useState("");
  const [description, setDescription] = useState("");

  // wineries for the dropdown
  const [wineries, setWineries] = useState([]);

  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // load the wineries for the dropdown, and the wine itself when editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const wineriesResponse = await api.get("/winery");
        setWineries(wineriesResponse.data);

        if (isEdit) {
          const wineResponse = await api.get(`/wine/${id}`);
          const wine = wineResponse.data;

          // ?? "" because an input's value can't be null or undefined
          setName(wine.name);
          setType(wine.type);
          setVintage(wine.vintage ?? "");
          setAlcohol(wine.alcohol);
          setColour(wine.colour ?? "");
          setRegion(wine.region ?? "");
          setPrice(wine.price);
          setWinery(wine.winery._id);
          setDescription(wine.description ?? "");
        }
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        console.error("Error loading the wine form:", error);
        setError("The form didn't load. Refresh the page to try again.");
      }
    };

    fetchData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmptyFields([]);

    // check the alcohol here, so the visitor gets a clear message
    if (alcohol !== "" && (alcohol < 0 || alcohol > 25)) {
      setEmptyFields(["alcohol"]);
      return;
    }

    const wine = { name, type, vintage, alcohol, colour, region, price, winery, description };

    setIsLoading(true);
    try {
      // PATCH changes an existing wine, POST makes a new one
      const response = isEdit
        ? await api.patch(`/wine/${id}`, wine)
        : await api.post("/wine", wine);

      navigate(`/wine/${response.data._id}`, { state: { notice: "Wine saved." } });
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      // the server lists the required fields that were left empty
      setEmptyFields(error.response?.data.emptyFields || []);
      setError("The wine wasn't saved. Check the fields and try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="page">
      <h1 className="page-title">{isEdit ? "Edit wine" : "Add wine"}</h1>

      <form className="form" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          id="name"
          value={name}
          setSpecificState={setName}
          error={emptyFields.includes("name") ? "Enter the wine's name." : null}
        />

        <div className="form__row">
          <div className={emptyFields.includes("type") ? "field field--invalid" : "field"}>
            <label className="field__label" htmlFor="type">
              Type
            </label>
            <select
              className="field__control"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Choose a type</option>
              {wineTypes.map((wineType) => (
                <option key={wineType} value={wineType}>
                  {wineType}
                </option>
              ))}
            </select>
            {emptyFields.includes("type") && (
              <span className="field__error">Choose a type.</span>
            )}
          </div>

          <TextField
            label="Vintage"
            id="vintage"
            type="number"
            placeholder="2021"
            value={vintage}
            setSpecificState={setVintage}
          />

          <TextField
            label="Alcohol (%)"
            id="alcohol"
            type="number"
            placeholder="13.5"
            value={alcohol}
            setSpecificState={setAlcohol}
            error={
              emptyFields.includes("alcohol") ? "Enter a percentage between 0 and 25." : null
            }
          />
        </div>

        <div className="form__row">
          <TextField
            label="Colour"
            id="colour"
            placeholder="Deep garnet"
            value={colour}
            setSpecificState={setColour}
          />

          <TextField
            label="Region"
            id="region"
            placeholder="Brač"
            value={region}
            setSpecificState={setRegion}
          />

          <TextField
            label="Price (€)"
            id="price"
            type="number"
            placeholder="22"
            value={price}
            setSpecificState={setPrice}
            error={emptyFields.includes("price") ? "Enter a price in euros." : null}
          />
        </div>

        <div className={emptyFields.includes("winery") ? "field field--invalid" : "field"}>
          <label className="field__label" htmlFor="winery">
            Winery
          </label>
          <select
            className="field__control"
            id="winery"
            value={winery}
            onChange={(e) => setWinery(e.target.value)}
          >
            <option value="">Choose a winery</option>
            {wineries.map((wineryOption) => (
              <option key={wineryOption._id} value={wineryOption._id}>
                {wineryOption.name}
              </option>
            ))}
          </select>
          {emptyFields.includes("winery") ? (
            <span className="field__error">Choose a winery.</span>
          ) : (
            <span className="field__help">
              Missing a winery? <Link to="/winery/new">Add it first</Link>, then come back.
            </span>
          )}
        </div>

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
            Save wine
          </button>
          <Link className="btn btn--text" to={isEdit ? `/wine/${id}` : "/"}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
};

export default WineForm;

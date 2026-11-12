import { useState } from "react";

// A winery's logo. With no logo url, or if the image fails to load,
// it shows the winery's first letter instead.
const WineryLogo = ({ name, logoUrl, small }) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const sizeClass = small ? " winery-profile__logo--small" : "";

  if (!logoUrl || logoFailed) {
    return (
      <div
        className={"winery-profile__logo winery-profile__logo--empty" + sizeClass}
        aria-hidden="true"
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      className={"winery-profile__logo" + sizeClass}
      src={logoUrl}
      alt={`${name} logo`}
      onError={() => setLogoFailed(true)}
    />
  );
};

export default WineryLogo;

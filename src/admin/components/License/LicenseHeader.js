import React from "react";

const LicenseHeader = ({ title, subtitle }) => {
  return (
    <div className="wap-license-header">
      <div className="wap-license-header__inner">
        <div>
          <h3 className="wap-license-header__title">{title}</h3>
          <p className="wap-license-header__subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default LicenseHeader;

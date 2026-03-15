import React from "react";

const LicenseHeader = ({ title, subtitle }) => {
  return (
    <div className="px-6 py-5 border-b flex justify-between items-center border-slate-200">
      <div className="flex items-center gap-5">
        <div className="max-w-2xl">
          <h3 className="m-0 text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 mb-0 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default LicenseHeader;

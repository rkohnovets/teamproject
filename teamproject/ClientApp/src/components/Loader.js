import React, { useState } from 'react';

const Loader = (props) => {
    return (
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    );
}

export default Loader;
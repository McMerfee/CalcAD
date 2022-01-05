import React from 'react';
import PropTypes from 'prop-types';

const PlusMinusControl = ({
  amount,
  setAmount,
}) => {
  const handleSetAmount = (type) => {
    if (type === 'plus') setAmount(+amount + 1);
    if (type === 'minus') setAmount(+amount - 1);
  };

  return (
    <div className="plus-minus-control">
      <button type="button" className="minus-control" onClick={() => handleSetAmount('minus')} />
      <div className="plus-minus-control-amount">{amount}</div>
      <button type="button" className="plus-control" onClick={() => handleSetAmount('plus')} />
    </div>
  );
};

PlusMinusControl.propTypes = {
  amount: PropTypes.number,
  setAmount: PropTypes.func,
};

PlusMinusControl.defaultProps = {
  amount: 0,
  setAmount: () => {},
};

export default PlusMinusControl;

import { menuItems } from '../../../util/menuItems';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { setOpenDrawer, setPage } from '../../../stores/slices/appSlice.ts';
import { useStyles } from './MenuHeadMUI';

export const MenuHead = () => {

    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const page = useAppSelector((state) => state.app.page);

    function handleUpdatePage(item) {
    if (page === item.key) {
      return;
    }

    dispatch(setPage(item.key));

    if (item.key === menuItems[0].key) {
      navigate('/');
      return;
    }

    if (item.key === 'user-guide') {
      window.open(`https://amrnet.readthedocs.io/en/staging/`, '_blank');
      return;
    }

    // navigate(`/${item.key}`);
    window.open(`#/${item.key}`, '_blank');
  }
    return (
        <div className={classes.headDiv }>
            {menuItems.map((item, index) => (
                <div key={index} className={classes.itemDiv}>
                    <a href={item.link} onClick={() => handleUpdatePage(item)}>
                        {item.label}
                    </a>
                </div>
            ))}
        </div>
    );
};

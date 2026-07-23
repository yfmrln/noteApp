import { FiChevronsLeft, FiLogOut } from 'react-icons/fi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Item from './Item';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../../modules/auth/current-user.state';
import { clearSession } from '../../lib/firestore-session';

// ユーザー情報を表示するサイドバー用の部品です。
// ログアウト操作もここから行えるようにしています。
export default function UserItem() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

  const signout = async () => {
    setCurrentUser(undefined);
    await clearSession();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='user-item-trigger' role='button'>
          <div className='user-item-info'>
            <span className='user-item-name'>
              {currentUser!.name} さんのノート
            </span>
          </div>
          <FiChevronsLeft className='user-item-chevron' size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='user-item-dropdown'
        align='start'
        alignOffset={11}
        forceMount
      >
        <div className='user-item-dropdown-content'>
          <p className='user-item-email'>{currentUser!.email}</p>
          <div className='user-item-info'>
            <div>
              <p className='user-item-name-display'>{currentUser!.name}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='user-item-logout'>
          <Item label='ログアウト' icon={FiLogOut} onClick={signout} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

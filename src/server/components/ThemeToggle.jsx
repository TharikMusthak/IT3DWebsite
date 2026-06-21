export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button 
      onClick={onToggle} 
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} 
      style={{ width:60,height:32,borderRadius:999,border:'none',background:isDark?'#4f46e5':'#d1d5db',position:'relative',cursor:'pointer',transition:'all 0.3s ease',padding:0 }}
    >
      <div style={{ width:26,height:26,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:isDark?31:3,transition:'all 0.3s ease',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px' }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
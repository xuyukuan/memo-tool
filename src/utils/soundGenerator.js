export function playTone(frequency, duration, type = 'sine') {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.type = type
  oscillator.frequency.value = frequency
  
  gainNode.gain.value = 0.1
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.start()
  oscillator.stop(audioContext.currentTime + duration)
}

export function playRevealSound() {
  playTone(800, 0.1, 'sine')
  setTimeout(() => playTone(1200, 0.15, 'sine'), 50)
}

export function playCorrectSound() {
  playTone(523.25, 0.1, 'sine')
  setTimeout(() => playTone(659.25, 0.2, 'sine'), 100)
}

export function playWrongSound() {
  playTone(200, 0.3, 'triangle')
}

export function playCompleteSound() {
  const notes = [523.25, 659.25, 783.99, 1046.50]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine'), i * 100)
  })
}
